import { useForm } from '@inertiajs/react';
import {
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

const EditVideo = ({ reloadPage, onClose, albums, video }) => {
  const { data, setData, put, processing, errors } = useForm('EditVideo', {
    url: video.watch_url,
    title: video.title ?? '',
    description: video.description ?? '',
    album_id: video.album_id ?? null,
    url_alias: video.url_alias ?? '',
    date_taken: video.date_taken ? video.date_taken.slice(0, 10) : '',
    is_public: Boolean(video.is_public),
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(`/admin/videos/${video.id}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
      },
    });
  };

  return (
    <Stack component="form" onSubmit={onSubmit} gap="sm">
      <TextInput
        label="YouTube URL"
        required
        value={data.url}
        onChange={(e) => setData('url', e.target.value)}
        error={errors?.url}
      />
      <TextInput
        label="Title"
        required
        value={data.title}
        onChange={(e) => setData('title', e.target.value)}
        error={errors?.title}
      />
      <Textarea
        label="Description"
        autosize
        minRows={2}
        value={data.description}
        onChange={(e) => setData('description', e.target.value)}
        error={errors?.description}
      />
      <Select
        label="Album"
        description="Leave empty to show this in the standalone Videos section."
        searchable
        clearable
        value={data.album_id ? String(data.album_id) : null}
        onChange={(val) => setData('album_id', val ? Number(val) : null)}
        data={albums.map((album) => ({
          value: String(album.id),
          label: album.name,
        }))}
        error={errors?.album_id}
      />
      <Group grow>
        <TextInput
          label="URL Alias"
          value={data.url_alias}
          onChange={(e) => setData('url_alias', e.target.value)}
          error={errors?.url_alias}
        />
        <TextInput
          label="Date"
          type="date"
          value={data.date_taken}
          onChange={(e) => setData('date_taken', e.target.value)}
          error={errors?.date_taken}
        />
      </Group>
      <Checkbox
        label="Public"
        checked={data.is_public}
        onChange={(e) => setData('is_public', e.currentTarget.checked)}
      />

      <Group justify="flex-end" my="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="green"
          leftSection={<IconPencil size={14} />}
          loading={processing}
        >
          Save Video
        </Button>
      </Group>
    </Stack>
  );
};

export default EditVideo;
