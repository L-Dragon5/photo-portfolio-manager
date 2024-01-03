import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import { AddIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  Spacer,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import BaseLayout from './components/BaseLayout';

const Culling = ({ album }) => {
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [selectedIds, setSelectedIds] = useState(
    album?.related_photos?.map((r) => r.id),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const toast = useToast();

  const customRenderPhoto = ({ renderDefaultPhoto, wrapperStyle, photo }) => {
    const { id } = photo;

    const onSelection = (e) => {
      e.stopPropagation();
      if (e.target.checked) {
        setSelectedIds((prevState) => [...prevState, id]);
      } else {
        setSelectedIds((prevState) =>
          prevState.toSpliced(prevState.indexOf(id), 1),
        );
      }
    };

    return (
      <Box position="relative" {...wrapperStyle}>
        <Box
          position="absolute"
          bottom="56px"
          left={0}
          p={2}
          bgColor="blackAlpha.600"
          width="full"
          zIndex={1}
        >
          <Text w="full" noOfLines={1} color="gray.100">
            {photo.title}
          </Text>
        </Box>

        <Box
          filter={!selectedIds.includes(id) ? 'grayscale(1)' : null}
          cursor="pointer"
        >
          {renderDefaultPhoto({ wrapped: true })}
        </Box>

        {selectedIds.includes(id) ? (
          <HStack bgColor={useColorModeValue('green.200', 'green.700')} p={4}>
            <Checkbox
              defaultChecked={selectedIds.includes(id)}
              checked={selectedIds.includes(id)}
              size="lg"
              w="full"
              h="full"
              onChange={onSelection}
            >
              Selected
            </Checkbox>
          </HStack>
        ) : (
          <HStack bgColor={useColorModeValue('red.200', 'red.700')} p={4}>
            <Checkbox
              defaultChecked={selectedIds.includes(id)}
              checked={selectedIds.includes(id)}
              size="lg"
              w="full"
              h="full"
              onChange={onSelection}
            >
              Not Selected
            </Checkbox>
          </HStack>
        )}
      </Box>
    );
  };

  const onSave = () => {
    setIsSubmitting(true);

    router.put(
      '/culling',
      {
        album_id: album.id,
        ids: selectedIds,
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          onAlertClose();
          toast({
            title: 'Selected Photos Updated',
            description:
              'Thank you for selecting the files. I will beging editing and return back to you shortly.',
            status: 'success',
            position: 'top-right',
            duration: 3000,
            isClosable: true,
          });
        },
      },
    );
  };

  return (
    <BaseLayout title={album.name}>
      {album?.previews.length > 0 && (
        <>
          <HStack mb={4}>
            <VStack alignItems="left">
              <Heading>Culling - {album.name}</Heading>
              <Heading size="lg" variant="h3">
                Selecting photos to edit
              </Heading>
            </VStack>
            <Spacer />
            <Button
              leftIcon={<AddIcon />}
              colorScheme="teal"
              onClick={onAlertOpen}
            >
              Submit
            </Button>
          </HStack>

          <PhotoAlbum
            layout="masonry"
            photos={album?.previews?.map((photo) => photo?.html)}
            columns={(containerWidth) => {
              if (containerWidth <= 500) return 1;
              if (containerWidth < 600) return 2;
              if (containerWidth < 1200) return 2;
              if (containerWidth < 1450) return 3;
              if (containerWidth < 2800) return 4;
              return 5;
            }}
            onClick={({ index: current }) => setPhotoIndex(current)}
            renderPhoto={customRenderPhoto}
          />

          <Lightbox
            open={photoIndex >= 0}
            close={() => setPhotoIndex(-1)}
            index={photoIndex}
            slides={album?.previews?.map((photo) => photo?.html)}
            plugins={[Captions, Counter, Zoom]}
            counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
          />
        </>
      )}

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Submit Files to Edit
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>
                By selecting these photos for editing, you agree to allow me to
                edit your photos as I see fit.
              </Text>
              <Text>
                Unless otherwise stated to me, you agree for me to post the
                final edited photos on this website for public view and to my
                various social media.
              </Text>
              <Text mt={6}>
                If you have any concerns with anything stated above, just
                contact me.
              </Text>
              <Text fontSize="2xs">This isn't legally binding</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={onSave}
                isLoading={isSubmitting}
              >
                I agree
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </BaseLayout>
  );
};

export default Culling;
