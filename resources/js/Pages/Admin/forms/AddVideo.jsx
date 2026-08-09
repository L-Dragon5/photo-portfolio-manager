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
import { IconPlus } from '@tabler/icons-react';

const AddVideo = ({ reloadPage, onClose, albums }) => {
  const { data, setData, post, reset, processing, errors } = useForm(
    'AddVideo',
    {
      url: '',
      title: '',
      description: '',
      album_id: null,
      url_alias: '',
      date_taken: '',
      is_public: true,
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    post('/admin/videos', {
      onSuccess: () => {
        reloadPage();
        onClose();
        reset();
      },
    });
  };

  return (
    <Stack component="form" onSubmit={onSubmit} gap="sm">
      <TextInput
        label="YouTube URL"
        description="Unlisted videos work. Paste the watch, share, or embed link."
        placeholder="https://www.youtube.com/watch?v=..."
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
          leftSection={<IconPlus size={14} />}
          loading={processing}
        >
          Add New Video
        </Button>
      </Group>
    </Stack>
  );
};

export default AddVideo;
