import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import { router } from '@inertiajs/react';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import { useState } from 'react';
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
      <Box pos="relative" style={wrapperStyle}>
        <Box
          style={{
            position: 'absolute',
            bottom: '56px',
            left: 0,
            padding: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: '100%',
            zIndex: 1,
          }}
        >
          <Text w="100%" lineClamp={1} c="gray.1">
            {photo.title}
          </Text>
        </Box>

        <Box
          style={{
            filter: !selectedIds.includes(id) ? 'grayscale(1)' : undefined,
            cursor: 'pointer',
          }}
        >
          {renderDefaultPhoto({ wrapped: true })}
        </Box>

        <Box bg={selectedIds.includes(id) ? 'green.2' : 'red.2'} p="md">
          <Checkbox
            checked={selectedIds.includes(id)}
            size="lg"
            w="100%"
            onChange={onSelection}
            label={selectedIds.includes(id) ? 'Selected' : 'Not Selected'}
          />
        </Box>
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
          notifications.show({
            title: 'Selected Photos Updated',
            message:
              'Thank you for selecting the files. I will begin editing and return back to you shortly.',
            color: 'teal',
            position: 'top-right',
            autoClose: 3000,
          });
        },
        onError: () => {
          setIsSubmitting(false);
          notifications.show({
            color: 'red',
            title: 'Submission failed',
            message: 'Something went wrong. Please try again.',
          });
        },
      },
    );
  };

  const openConfirmModal = () => {
    modals.openConfirmModal({
      title: 'Submit Files to Edit',
      children: (
        <Stack gap="sm">
          <Text>
            By selecting these photos for editing, you agree to allow me to edit
            your photos as I see fit.
          </Text>
          <Text>
            Unless otherwise stated to me, you agree for me to post the final
            edited photos on this website for public view and to my various
            social media.
          </Text>
          <Text mt="md">
            If you have any concerns with anything stated above, just contact
            me.
          </Text>
          <Text size="xs">This isn't legally binding</Text>
        </Stack>
      ),
      labels: { confirm: 'I agree', cancel: 'Cancel' },
      confirmProps: { color: 'green', loading: isSubmitting },
      onConfirm: onSave,
    });
  };

  return (
    <BaseLayout title={album.name}>
      {album?.previews.length > 0 && (
        <>
          <Group
            mb="md"
            style={{
              position: 'sticky',
              top: '-1rem',
              zIndex: 2,
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Stack gap={0}>
              <Title>Culling - {album.name}</Title>
              <Title order={3}>Selecting photos to edit</Title>
            </Stack>
            <Box style={{ flex: 1 }} />
            <Button
              leftSection={<IconSend size={14} />}
              color="teal"
              onClick={openConfirmModal}
            >
              Submit
            </Button>
          </Group>

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
