import { router } from '@inertiajs/react';
import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Modal,
  ScrollArea,
  Select,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import AdminLayout from './components/AdminLayout';
import AddCosplayer from './forms/AddCosplayer';
import EditCosplayer from './forms/EditCosplayer';

const Cosplayers = ({ cosplayers }) => {
  const [sortingOption, setSortingOption] = useState('name-asc');
  const [activeCosplayers, setActiveCosplayers] = useState(cosplayers);
  const [modifyCosplayer, setModifyCosplayer] = useState(null);

  useEffect(() => {
    if (sortingOption === 'name-asc') {
      setActiveCosplayers(cosplayers);
    } else if (sortingOption === 'name-desc') {
      setActiveCosplayers(cosplayers.toReversed());
    }
  }, [sortingOption]);

  useEffect(() => {
    setActiveCosplayers(cosplayers);
  }, [cosplayers]);

  const [isModalOpen, { open: onModalOpen, close: onModalClose }] =
    useDisclosure(false);

  const reloadPage = () => {
    router.reload({
      only: ['cosplayers'],
    });
  };

  const handleModalClose = () => {
    onModalClose();
    setModifyCosplayer(null);
  };

  const onEditClick = (e, cosplayerObj) => {
    setModifyCosplayer(cosplayerObj);
    onModalOpen();
  };

  const onDeleteClick = (e, cosplayerObj) => {
    setModifyCosplayer(cosplayerObj);
    modals.openConfirmModal({
      title: `Delete Cosplayer - ${cosplayerObj.name}`,
      children: "Are you sure? You can't undo this action afterwards.",
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        router.delete(`/admin/cosplayers/${cosplayerObj.id}`, {
          onSuccess: () => reloadPage(),
        });
      },
    });
  };

  return (
    <>
      <Group mb="md">
        <Select
          value={sortingOption}
          onChange={(val) => setSortingOption(val ?? 'name-asc')}
          data={[
            { value: 'name-asc', label: 'Name - A to Z' },
            { value: 'name-desc', label: 'Name - Z to A' },
          ]}
          style={{ flex: 1 }}
        />
        <Button
          color="teal"
          leftSection={<IconPlus size={14} />}
          w="50%"
          onClick={onModalOpen}
        >
          Add Cosplayer
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={600} mah="95%">
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Instagram</Table.Th>
              <Table.Th>Twitter</Table.Th>
              <Table.Th>Options</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {activeCosplayers?.map((cosplayer) => (
              <Table.Tr key={cosplayer.id}>
                <Table.Td>{cosplayer.name}</Table.Td>
                <Table.Td>
                  {cosplayer?.instagram ? (
                    <Anchor
                      href={`https://instagram.com/${cosplayer.instagram}`}
                      target="_blank"
                    >
                      {cosplayer.instagram}
                    </Anchor>
                  ) : (
                    'N/A'
                  )}
                </Table.Td>
                <Table.Td>
                  {cosplayer?.twitter ? (
                    <Anchor
                      href={`https://x.com/${cosplayer.twitter}`}
                      target="_blank"
                    >
                      {cosplayer.twitter}
                    </Anchor>
                  ) : (
                    'N/A'
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      aria-label="Edit cosplayer"
                      onClick={(e) => onEditClick(e, cosplayer)}
                      variant="default"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      aria-label="Delete cosplayer"
                      onClick={(e) => onDeleteClick(e, cosplayer)}
                      color="red"
                      variant="subtle"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal
        opened={isModalOpen}
        onClose={handleModalClose}
        closeOnClickOutside={false}
        scrollAreaComponent={ScrollArea.Autosize}
        size="5xl"
        title={
          modifyCosplayer !== null
            ? `Edit Cosplayer - ${modifyCosplayer.name}`
            : 'Add Cosplayer'
        }
      >
        {modifyCosplayer !== null ? (
          <EditCosplayer
            reloadPage={reloadPage}
            onClose={onModalClose}
            cosplayer={modifyCosplayer}
          />
        ) : (
          <AddCosplayer reloadPage={reloadPage} onClose={onModalClose} />
        )}
      </Modal>
    </>
  );
};

Cosplayers.layout = (page) => (
  <AdminLayout title="All Cosplayers">{page}</AdminLayout>
);

export default Cosplayers;
