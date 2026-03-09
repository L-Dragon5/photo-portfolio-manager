import { useForm } from '@inertiajs/react';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

const AddEvent = ({ reloadPage, onClose }) => {
  const { data, setData, post, reset, processing, errors } = useForm(
    'AddEvent',
    {
      name: '',
      url_alias: '',
      start_date: '',
      end_date: '',
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/events`, {
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
        label="Event Name"
        required
        value={data.name}
        onChange={(e) => setData('name', e.target.value)}
        error={errors?.name}
      />

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
          leftSection={<IconPlus size={14} />}
          loading={processing}
        >
          Add New Event
        </Button>
      </Group>
    </Stack>
  );
};

export default AddEvent;
