import { router } from '@inertiajs/react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  Title,
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
import useDirectUpload from '../hooks/useDirectUpload';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const UploadAlbum = ({ reloadPage, onClose, type, album }) => {
  const [albumMedia, setAlbumMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [activeCoverImage, setActiveCoverImage] = useState(
    album?.cover_image_id,
  );
  const [files, setFiles] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [pendingIngest, setPendingIngest] = useState(0);
  const { upload, reset, progress, isUploading, error } = useDirectUpload({
    albumId: album?.id,
    collection: type,
  });

  const fetchMedia = (signal) =>
    fetch(`/admin/albums/${album.id}/media`, { signal })
      .then((res) => res.json())
      .then((data) => data[type] ?? []);

  useEffect(() => {
    if (!album?.id) {
      return;
    }

    const controller = new AbortController();
    setIsLoadingMedia(true);

    fetchMedia(controller.signal)
      .then((media) => {
        setAlbumMedia(media);
        setIsLoadingMedia(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsLoadingMedia(false);
        }
      });

    return () => controller.abort();
  }, [album?.id, type]);

  /**
   * Ingest happens on the queue, so the media list lags the upload. Poll until
   * every queued file has landed, or give up quietly after the timeout.
   */
  const pollForIngest = async (expectedCount) => {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      try {
        const media = await fetchMedia();
        setAlbumMedia(media);
        setPendingIngest(Math.max(expectedCount - media.length, 0));

        if (media.length >= expectedCount) {
          return true;
        }
      } catch {
        // Transient failure; the next tick retries.
      }
    }

    return false;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const { uploaded, failed } = await upload(files);

    if (uploaded === 0) {
      notifications.show({
        color: 'red',
        title: 'Upload failed',
        message: error ?? 'No files were uploaded. See the list for details.',
      });
      return;
    }

    setFiles(files.filter((file) => failed.includes(file.name)));
    setPendingIngest(uploaded);

    notifications.show({
      color: 'blue',
      title: `Processing ${uploaded} image${uploaded === 1 ? '' : 's'}`,
      message: 'Uploaded to storage. Generating web versions now.',
    });

    const settled = await pollForIngest(albumMedia.length + uploaded);
    setPendingIngest(0);
    reloadPage();

    if (settled) {
      reset();
      notifications.show({
        color: 'green',
        title: 'Upload complete',
        message: `${uploaded} image${uploaded === 1 ? '' : 's'} added.`,
      });
    } else {
      notifications.show({
        color: 'yellow',
        title: 'Still processing',
        message:
          'Some images are still being processed. Reopen this drawer shortly.',
      });
    }

    if (failed.length > 0) {
      notifications.show({
        color: 'red',
        title: `${failed.length} upload${failed.length === 1 ? '' : 's'} failed`,
        message: 'The failed files are still selected. Try again.',
      });
    }
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

  /**
   * ponytail: overlay controls render only for the hovered tile. Mounting them
   * for every photo put 3 Mantine Tooltips + 3 ActionIcons per image on the
   * page, which froze (and at ~1800 photos crashed) the tab. Native `title`
   * replaces Tooltip for the same reason — no Floating UI instance per button.
   */
  const customRenderPhoto = ({ renderDefaultPhoto, wrapperStyle, photo }) => {
    const { id, index } = photo;

    return (
      <Box
        pos="relative"
        style={wrapperStyle}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {renderDefaultPhoto({ wrapped: true })}
        {hoveredIndex === index ? (
          <>
            <ActionIcon
              title="Permanently delete photo"
              onClick={() => handleImageDelete(id, index)}
              pos="absolute"
              color="red"
              top={0}
              right={0}
            >
              <IconTrash size={16} />
            </ActionIcon>
            {type === 'photos' ? (
              <>
                <ActionIcon
                  title="Set as album cover image"
                  onClick={() => handleSetCoverImage(id)}
                  pos="absolute"
                  top={0}
                  left={0}
                  color={id === activeCoverImage ? 'yellow' : undefined}
                >
                  <IconStar size={16} />
                </ActionIcon>
                <ActionIcon
                  title="Set as featured photo"
                  onClick={() => handleToggleFeaturedPhoto(id)}
                  pos="absolute"
                  top={0}
                  left="50%"
                >
                  <IconLink size={16} />
                </ActionIcon>
              </>
            ) : null}
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
        <Dropzone
          files={files}
          onFilesChange={setFiles}
          progress={progress}
          disabled={isUploading}
        />

        {error ? (
          <Text size="sm" c="red">
            {error}
          </Text>
        ) : null}

        {pendingIngest > 0 ? (
          <Group gap="xs">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">
              Processing {pendingIngest} image
              {pendingIngest === 1 ? '' : 's'}…
            </Text>
          </Group>
        ) : null}

        <Group justify="flex-end" my="md">
          <Button variant="default" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="green"
            leftSection={<IconDownload size={14} />}
            loading={isUploading || pendingIngest > 0}
            disabled={files.length === 0}
          >
            Add Images
          </Button>
        </Group>
      </Stack>
    </>
  );
};

export default UploadAlbum;
