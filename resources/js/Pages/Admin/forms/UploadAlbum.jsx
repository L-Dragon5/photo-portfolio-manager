import { AddIcon, DeleteIcon, StarIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  VStack,
} from '@chakra-ui/react';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import Dropzone from '../components/Dropzone';

const UploadAlbum = ({ reloadPage, onClose, type, album }) => {
  const [activeAlbum, setActiveAlbum] = useState(album);
  const [activeCoverImage, setActiveCoverImage] = useState(
    album?.cover_image_id,
  );
  const [images, setImages] = useState([]);
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

  return (
    <>
      <Heading mb={3}>Uploaded Images</Heading>
      <Flex flexDirection="row" gap={2}>
        {activeAlbum?.[type]?.map((image, index) => (
          <HStack key={image.id}>
            <Box position="relative">
              <Image {...image?.html} maxH="150px" width="auto" />
              <IconButton
                icon={<DeleteIcon />}
                onClick={() => handleImageDelete(image.id, index)}
                position="absolute"
                top={0}
                right={0}
                opacity={0.5}
                _hover={{ opacity: 1 }}
              />
              {type === 'photos' ? (
                <IconButton
                  icon={
                    <StarIcon
                      color={image.id === activeCoverImage ? 'yellow' : 'black'}
                    />
                  }
                  onClick={() => handleSetCoverImage(image.id)}
                  position="absolute"
                  top={0}
                  left={0}
                  opacity={0.5}
                  _hover={{ opacity: 1 }}
                />
              ) : null}
            </Box>
          </HStack>
        ))}
      </Flex>

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
