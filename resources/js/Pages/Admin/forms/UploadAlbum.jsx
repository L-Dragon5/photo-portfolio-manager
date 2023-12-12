import { AddIcon, DeleteIcon, LinkIcon, StarIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { router, useForm } from '@inertiajs/react';
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

  const customRenderPhoto = ({ renderDefaultPhoto, photo }) => {
    const { id, index } = photo;

    return (
      <Box position="relative">
        {renderDefaultPhoto({ wrapped: true })}
        <Tooltip label="Permanently delete photo">
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleImageDelete(id, index)}
            position="absolute"
            top={0}
            right={0}
            bgColor={useColorModeValue('gray.200', 'gray.700')}
            opacity={0.5}
            _hover={{ opacity: 1 }}
          />
        </Tooltip>
        {type === 'photos' ? (
          <>
            <Tooltip label="Set as album cover image">
              <IconButton
                icon={
                  <StarIcon
                    color={id === activeCoverImage ? 'yellow' : 'black'}
                  />
                }
                onClick={() => handleSetCoverImage(id)}
                position="absolute"
                top={0}
                left={0}
                bgColor={useColorModeValue('gray.200', 'gray.700')}
                opacity={0.5}
                _hover={{ opacity: 1 }}
              />
            </Tooltip>
            <Tooltip label="Set as featured photo">
              <IconButton
                icon={<LinkIcon />}
                onClick={() => handleToggleFeaturedPhoto(id)}
                position="absolute"
                top={0}
                left="50%"
                bgColor={useColorModeValue('gray.200', 'gray.700')}
                opacity={0.5}
                _hover={{ opacity: 1 }}
              />
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
          colorScheme="red"
          onClick={handlePurgePreviews}
          isLoading={isSubmitting}
        >
          Purge Previews
        </Button>
      ) : null}
      <Heading mb={3}>Uploaded Images</Heading>
      <PhotoAlbum
        layout="rows"
        photos={album?.[type]?.map((image, index) => ({
          ...image?.html,
          index,
        }))}
        renderPhoto={customRenderPhoto}
      />

      <VStack as="form" onSubmit={onSubmit} spacing={3} mt={8}>
        <Dropzone setPhotos={setImages} />

        <HStack justifyContent="flex-end" my={4} w="full">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            colorScheme="green"
            leftIcon={<AddIcon />}
            isLoading={processing}
          >
            Add Images
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default UploadAlbum;
