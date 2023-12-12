import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import BaseLayout from './components/BaseLayout';

const Culling = ({ album }) => {
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customRenderPhoto = ({ renderDefaultPhoto, photo }) => {
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
      <Box position="relative" mb={4}>
        <Text
          position="absolute"
          bgColor="blackAlpha.700"
          zIndex={1}
          w="full"
          noOfLines={1}
        >
          {photo.title}
        </Text>
        <Box
          filter={!selectedIds.includes(id) ? 'grayscale(1)' : null}
          cursor="pointer"
        >
          {renderDefaultPhoto({ wrapped: true })}
        </Box>

        {selectedIds.includes(id) ? (
          <HStack bgColor={useColorModeValue('green.200', 'green.700')} p={4}>
            <Text>Selected</Text>
            <Spacer />
            <Checkbox
              defaultChecked={selectedIds.includes(id)}
              checked={selectedIds.includes(id)}
              size="lg"
              onChange={onSelection}
            />
          </HStack>
        ) : (
          <HStack bgColor={useColorModeValue('red.200', 'red.700')} p={4}>
            <Text>Not Selected</Text>
            <Spacer />
            <Checkbox
              defaultChecked={selectedIds.includes(id)}
              checked={selectedIds.includes(id)}
              size="lg"
              onChange={onSelection}
            />
          </HStack>
        )}
      </Box>
    );
  };

  const onSave = () => {};

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
              onClick={onSave}
              isLoading={isSubmitting}
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
    </BaseLayout>
  );
};

export default Culling;
