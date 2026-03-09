import { useForm } from '@inertiajs/react';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

const EditCosplayer = ({ reloadPage, onClose, cosplayer }) => {
  const { data, setData, put, processing, errors } = useForm(
    `EditCosplayer-${cosplayer.id}`,
    {
      name: cosplayer?.name ?? '',
      instagram: cosplayer?.instagram ?? '',
      twitter: cosplayer?.twitter ?? '',
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    put(`/admin/cosplayers/${cosplayer.id}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
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
          leftSection={<IconRefresh size={14} />}
          loading={processing}
        >
          Update Cosplayer
        </Button>
      </Group>
    </Stack>
  );
};

export default EditCosplayer;
