import { useForm } from '@inertiajs/react';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

const AddCosplayer = ({ reloadPage, onClose }) => {
  const { data, setData, post, reset, processing, errors } = useForm(
    'AddCosplayer',
    {
      name: '',
      instagram: '',
      twitter: '',
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/cosplayers`, {
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
        label="Cosplayer Name"
        required
        value={data.name}
        onChange={(e) => setData('name', e.target.value)}
        error={errors?.name}
      />
      <Group grow>
        <TextInput
          label="Instagram"
          value={data.instagram}
          onChange={(e) => setData('instagram', e.target.value)}
          error={errors?.instagram}
        />
        <TextInput
          label="Twitter"
          value={data.twitter}
          onChange={(e) => setData('twitter', e.target.value)}
          error={errors?.twitter}
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
          Add New Cosplayer
        </Button>
      </Group>
    </Stack>
  );
};

export default AddCosplayer;
