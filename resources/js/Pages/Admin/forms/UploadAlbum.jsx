import { router, useForm } from '@inertiajs/react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconDownload,
  IconLink,
  IconStar,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import PhotoAlbum from 'react-photo-album';

import Dropzone from '../components/Dropzone';

const UploadAlbum = ({ reloadPage, onClose, type, album }) => {
  const [activeAlbum, setActiveAlbum] = useState(album);
  const [activeCoverImage, setActiveCoverImage] = useState(
    album?.cover_image_id,
  );
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setData, post, processing, reset } = useForm('UploadAlbum', {
    images: [],
  });

  useEffect(() => {
    setData('images', images);
  }, [images]);

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/albums/${album?.id}/${type}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
        reset();
      },
    });
  };

  const handleImageDelete = (id, index) => {
    router.delete(`/admin/photos/${id}`, {
      onSuccess: () => {
        reloadPage();
        delete activeAlbum?.[type][index];
      },
    });
  };

  const handleSetCoverImage = (id) => {
    router.put(
      `/admin/albums/${album?.id}`,
      {
        cover_image_id: id,
      },
      {
        onSuccess: () => {
          reloadPage();
          setActiveCoverImage(id);
        },
      },
    );
  };

  const handleToggleFeaturedPhoto = (id) => {
    router.put(
      `/admin/photos/${id}/featured`,
      {},
      {
        onSuccess: () => {
          reloadPage();
        },
      },
    );
  };

  const handlePurgePreviews = () => {
    router.delete(`/admin/albums/${album?.id}/previews/purge`, {
      onSuccess: () => {
        reloadPage();
        onClose();
      },
    });
  };

  const customRenderPhoto = ({ renderDefaultPhoto, wrapperStyle, photo }) => {
    const { id, index } = photo;

    return (
      <Box pos="relative" style={wrapperStyle}>
        {renderDefaultPhoto({ wrapped: true })}
        <Tooltip label="Permanently delete photo">
          <ActionIcon
            onClick={() => handleImageDelete(id, index)}
            pos="absolute"
            top={0}
            right={0}
            style={{ opacity: 0.5 }}
            styles={{ root: { '&:hover': { opacity: 1 } } }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
        {type === 'photos' ? (
          <>
            <Tooltip label="Set as album cover image">
              <ActionIcon
                onClick={() => handleSetCoverImage(id)}
                pos="absolute"
                top={0}
                left={0}
                style={{ opacity: 0.5 }}
                styles={{ root: { '&:hover': { opacity: 1 } } }}
                color={id === activeCoverImage ? 'yellow' : undefined}
              >
                <IconStar size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Set as featured photo">
              <ActionIcon
                onClick={() => handleToggleFeaturedPhoto(id)}
                pos="absolute"
                top={0}
                left="50%"
                style={{ opacity: 0.5 }}
                styles={{ root: { '&:hover': { opacity: 1 } } }}
              >
                <IconLink size={16} />
              </ActionIcon>
            </Tooltip>
          </>
        ) : null}
      </Box>
    );
  };

  return (
    <>
      {type === 'previews' && album.is_public && album?.photos?.length > 0 ? (
        <Button
          color="red"
          onClick={handlePurgePreviews}
          loading={isSubmitting}
        >
          Purge Previews
        </Button>
      ) : null}
      <Title order={3} mb="sm">
        Uploaded Images
      </Title>
      <PhotoAlbum
        layout="rows"
        photos={album?.[type]?.map((image, index) => ({
          ...image?.html,
          index,
        }))}
        renderPhoto={customRenderPhoto}
      />

      <Stack component="form" onSubmit={onSubmit} gap="sm" mt="xl">
        <Dropzone setPhotos={setImages} />

        <Group justify="flex-end" my="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="green"
            leftSection={<IconDownload size={14} />}
            loading={processing}
          >
            Add Images
          </Button>
        </Group>
      </Stack>
    </>
  );
};

export default UploadAlbum;
