import { useForm } from '@inertiajs/react';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

const EditEvent = ({ reloadPage, onClose, event }) => {
  const { data, setData, put, processing, errors } = useForm(
    `EditEvent-${event.id}`,
    {
      name: event?.name ?? '',
      url_alias: event?.url_alias ?? '',
      start_date: event?.start_date ?? '',
      end_date: event?.end_date ?? '',
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    put(`/admin/events/${event.id}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
      },
    });
  };

  return (
    <Stack component="form" onSubmit={onSubmit} gap="sm">
      <Group grow>
        <TextInput
          label="Event Name"
          required
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          error={errors?.name}
        />
        <TextInput
          label="URL Alias"
          value={data.url_alias}
          onChange={(e) => setData('url_alias', e.target.value)}
          error={errors?.url_alias}
        />
      </Group>

      <Group grow>
        <TextInput
          label="Start Date"
          type="date"
          value={data.start_date}
          onChange={(e) => setData('start_date', e.target.value)}
          min="2013-01-01"
          max={new Date().toISOString().split('T')[0]}
          error={errors?.start_date}
        />
        <TextInput
          label="End Date"
          type="date"
          value={data.end_date}
          onChange={(e) => setData('end_date', e.target.value)}
          min="2013-01-01"
          max={new Date().toISOString().split('T')[0]}
          error={errors?.end_date}
        />
      </Group>

      <Group justify="flex-end" my="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="green"
          leftSection={<IconRefresh size={14} />}
          loading={processing}
        >
          Update Event
        </Button>
      </Group>
    </Stack>
  );
};

export default EditEvent;
