import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import { router, usePoll } from '@inertiajs/react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconSend } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import BaseLayout from './components/BaseLayout';

const Culling = ({ album, password }) => {
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [pending, setPending] = useState({});
  const [filter, setFilter] = useState('all');

  const serverSelectedIds = useMemo(
    () => new Set((album?.related_photos ?? []).map((r) => r.id)),
    [album?.related_photos],
  );

  const isSelected = useCallback(
    (id) =>
      Object.hasOwn(pending, id) ? pending[id] : serverSelectedIds.has(id),
    [pending, serverSelectedIds],
  );

  const { start: startPoll, stop: stopPoll } = usePoll(
    5000,
    { only: ['album'], preserveScroll: true, preserveState: true },
    { autoStart: true },
  );

  useEffect(() => {
    if (Object.keys(pending).length > 0) {
      stopPoll();
    } else {
      startPoll();
    }
  }, [pending, startPoll, stopPoll]);

  const togglePhoto = useCallback(
    (id, nextSelected) => {
      setPending((prev) => ({ ...prev, [id]: nextSelected }));

      router.put(
        `/culling/${password}/photos/${id}`,
        { selected: nextSelected },
        {
          preserveScroll: true,
          preserveState: true,
          only: ['album'],
          onFinish: () => {
            setPending((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          },
          onError: () => {
            notifications.show({
              color: 'red',
              title: 'Could not save',
              message: 'Your last change did not save. Please try again.',
            });
          },
        },
      );
    },
    [password],
  );

  const previews = album?.previews ?? [];
  const totalCount = previews.length;
  const selectedCount = previews.reduce(
    (acc, p) => acc + (isSelected(p?.html?.id) ? 1 : 0),
    0,
  );

  const visiblePhotos = useMemo(() => {
    return previews
      .map((p) => p?.html)
      .filter((html) => {
        if (!html) return false;
        if (filter === 'selected') return isSelected(html.id);
        if (filter === 'unselected') return !isSelected(html.id);
        return true;
      });
  }, [previews, filter, isSelected]);

  const currentLightboxPhoto = visiblePhotos[photoIndex];

  useEffect(() => {
    if (photoIndex < 0 || !currentLightboxPhoto) return;

    const handleKey = (e) => {
      if (e.key === ' ' || e.code === 'Space' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        togglePhoto(
          currentLightboxPhoto.id,
          !isSelected(currentLightboxPhoto.id),
        );
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [photoIndex, currentLightboxPhoto, isSelected, togglePhoto]);

  const customRenderPhoto = ({ renderDefaultPhoto, wrapperStyle, photo }) => {
    const { id } = photo;
    const selected = isSelected(id);

    const onSelection = (e) => {
      e.stopPropagation();
      togglePhoto(id, e.target.checked);
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
            filter: !selected ? 'grayscale(1)' : undefined,
            cursor: 'pointer',
          }}
        >
          {renderDefaultPhoto({ wrapped: true })}
        </Box>

        <Box bg={selected ? 'green.2' : 'red.2'} p="md">
          <Checkbox
            checked={selected}
            size="lg"
            w="100%"
            onChange={onSelection}
            label={selected ? 'Selected' : 'Not Selected'}
          />
        </Box>
      </Box>
    );
  };

  const submitCulling = () => {
    router.post(
      `/culling/${password}/complete`,
      { completed: true },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['album'],
        onSuccess: () => {
          notifications.show({
            title: 'Submitted',
            message:
              'Thank you for selecting the files. I will begin editing and return back to you shortly.',
            color: 'teal',
            position: 'top-right',
            autoClose: 3000,
          });
        },
        onError: () => {
          notifications.show({
            color: 'red',
            title: 'Submission failed',
            message: 'Something went wrong. Please try again.',
          });
        },
      },
    );
  };

  const undoSubmit = () => {
    router.post(
      `/culling/${password}/complete`,
      { completed: false },
      { preserveScroll: true, preserveState: true, only: ['album'] },
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
      confirmProps: { color: 'green' },
      onConfirm: submitCulling,
    });
  };

  const completedAt = album?.culling_completed_at
    ? new Date(album.culling_completed_at)
    : null;

  return (
    <BaseLayout title={album.name}>
      {previews.length > 0 && (
        <>
          <Group
            mb="md"
            wrap="wrap"
            style={{
              position: 'sticky',
              top: '-1rem',
              zIndex: 2,
              backgroundColor: 'var(--mantine-color-body)',
              paddingTop: '1rem',
              paddingBottom: '0.5rem',
            }}
          >
            <Stack gap={0}>
              <Title>Culling - {album.name}</Title>
              <Title order={3}>Selecting photos to edit</Title>
              <Text c="dimmed" mt={4}>
                {selectedCount} / {totalCount} selected
              </Text>
            </Stack>

            <Box style={{ flex: 1 }} />

            <SegmentedControl
              value={filter}
              onChange={setFilter}
              data={[
                { label: `All (${totalCount})`, value: 'all' },
                { label: `Selected (${selectedCount})`, value: 'selected' },
                {
                  label: `Unselected (${totalCount - selectedCount})`,
                  value: 'unselected',
                },
              ]}
            />

            {completedAt ? (
              <Group gap="xs">
                <Badge
                  color="teal"
                  size="lg"
                  leftSection={<IconCheck size={14} />}
                >
                  Submitted {completedAt.toLocaleDateString()}
                </Badge>
                <Button variant="subtle" size="xs" onClick={undoSubmit}>
                  Undo
                </Button>
              </Group>
            ) : (
              <Button
                leftSection={<IconSend size={14} />}
                color="teal"
                onClick={openConfirmModal}
              >
                Submit
              </Button>
            )}
          </Group>

          <Text c="dimmed" size="sm" mb="sm">
            Tip: open a photo and press Space or X to toggle selection.
          </Text>

          <PhotoAlbum
            layout="masonry"
            photos={visiblePhotos}
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
            slides={visiblePhotos}
            on={{ view: ({ index }) => setPhotoIndex(index) }}
            plugins={[Captions, Counter, Zoom]}
            counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
          />
        </>
      )}
    </BaseLayout>
  );
};

export default Culling;
