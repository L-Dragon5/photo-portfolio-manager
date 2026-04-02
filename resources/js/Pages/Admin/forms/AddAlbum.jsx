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
import { IconPlus, IconRefresh } from '@tabler/icons-react';

const AddAlbum = ({ events, reloadPage, onClose }) => {
  const { data, setData, post, processing, reset, errors } = useForm(
    'AddAlbum',
    {
      name: '',
      event_id: '',
      notes: '',
      url_alias: '',
      date_taken: '',
      password: '',
      is_press: false,
      is_public: false,
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/albums`, {
      onSuccess: () => {
        reloadPage();
        onClose();
        reset();
      },
    });
  };

  const generatePassword = () => {
    const newPass = (Math.random() + 1).toString(36).substring(5);
    setData('password', newPass);
  };

  return (
    <Stack component="form" onSubmit={onSubmit} gap="sm">
      <Group align="flex-start" grow>
        <TextInput
          label="Album Name"
          required
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          error={errors?.name}
        />
        <Select
          label="Event"
          searchable
          value={data.event_id}
          onChange={(val) => setData('event_id', val ?? '')}
          error={errors?.event_id}
          data={[
            { value: '', label: 'No Event' },
            ...(events?.map((event) => ({
              value: String(event.id),
              label: event.name,
            })) ?? []),
          ]}
        />
      </Group>
      <Group>
        <Checkbox
          label="Is Press?"
          checked={data.is_press}
          onChange={(e) => setData('is_press', e.target.checked)}
        />
        <Checkbox
          label="Is Public?"
          checked={data.is_public}
          onChange={(e) => setData('is_public', e.target.checked)}
        />
      </Group>
      <Group align="flex-start" grow>
        <TextInput
          label="Date Taken"
          type="date"
          value={data.date_taken}
          onChange={(e) => setData('date_taken', e.target.value)}
          min="2013-01-01"
          max={new Date().toISOString().split('T')[0]}
          error={errors?.date_taken}
        />
        <TextInput
          label="URL Alias"
          value={data.url_alias}
          onChange={(e) => setData('url_alias', e.target.value)}
          error={errors?.url_alias}
          description="Leave blank to generate one"
        />
      </Group>
      <Group align="flex-end">
        <TextInput
          label="Password"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          autoComplete="new-password"
          error={errors?.password}
          style={{ flex: 1 }}
        />
        <Button
          variant="default"
          onClick={generatePassword}
          leftSection={<IconRefresh size={14} />}
        >
          Generate
        </Button>
      </Group>
      <Textarea
        label="Notes"
        value={data.notes}
        onChange={(e) => setData('notes', e.target.value)}
        error={errors?.notes}
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
          Add New Album
        </Button>
      </Group>
    </Stack>
  );
};

export default AddAlbum;
