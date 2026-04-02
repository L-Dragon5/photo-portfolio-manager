import { router, useForm } from '@inertiajs/react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
  const [albumMedia, setAlbumMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [activeCoverImage, setActiveCoverImage] = useState(
    album?.cover_image_id,
  );
  const [files, setFiles] = useState([]);
  const { setData, post, processing, reset } = useForm('UploadAlbum', {
    images: [],
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  useEffect(() => {
    if (!album?.id) {
      return;
    }

    const controller = new AbortController();
    setIsLoadingMedia(true);

    fetch(`/admin/albums/${album.id}/media`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setAlbumMedia(data[type] ?? []);
        setIsLoadingMedia(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsLoadingMedia(false);
        }
      });

    return () => controller.abort();
  }, [album?.id, type]);

  const handleFilesChange = (updated) => {
    setFiles(updated);
    setData('images', updated);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/albums/${album?.id}/${type}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
        reset();
        setFiles([]);
      },
    });
  };

  const handleImageDelete = (id, index) => {
    const csrfToken = decodeURIComponent(
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] ?? '',
    );

    fetch(`/admin/photos/${id}`, {
      method: 'DELETE',
      headers: { 'X-XSRF-TOKEN': csrfToken },
    })
      .then(() => {
        reloadPage();
        setAlbumMedia((prev) => prev.filter((_, i) => i !== index));
      })
      .catch(() => {
        notifications.show({
          color: 'red',
          title: 'Delete failed',
          message: 'The photo could not be deleted. Please try again.',
        });
      });
  };

  const handleSetCoverImage = (id) => {
    router.put(
      `/admin/albums/${album?.id}/cover`,
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
            color="red"
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
      {type === 'previews' && album.is_public && album?.photos_count > 0 ? (
        <Button color="red" onClick={handlePurgePreviews}>
          Purge Previews
        </Button>
      ) : null}
      <Title order={3} mb="sm">
        Uploaded Images
      </Title>
      {isLoadingMedia ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : (
        <PhotoAlbum
          layout="rows"
          photos={albumMedia.map((image, index) => ({
            ...image?.html,
            index,
            id: image.id,
          }))}
          renderPhoto={customRenderPhoto}
        />
      )}

      <Stack component="form" onSubmit={onSubmit} gap="sm" mt="xl">
        <Dropzone files={files} onFilesChange={handleFilesChange} />

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
