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
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';

import AdminLayout from './components/AdminLayout';
import AddCosplayer from './forms/AddCosplayer';
import EditCosplayer from './forms/EditCosplayer';

const Cosplayers = ({ cosplayers }) => {
  const [sortingOption, setSortingOption] = useState('name-asc');
  const [activeCosplayers, setActiveCosplayers] = useState(cosplayers);
  const [modifyCosplayer, setModifyCosplayer] = useState(null);

  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: activeCosplayers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() -
        virtualItems[virtualItems.length - 1].end
      : 0;

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

      <div
        ref={parentRef}
        style={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}
      >
        <Table striped style={{ minWidth: 600 }}>
          <Table.Thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: 'var(--mantine-color-body)',
            }}
          >
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Instagram</Table.Th>
              <Table.Th>Twitter</Table.Th>
              <Table.Th>Options</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paddingTop > 0 && (
              <Table.Tr>
                <Table.Td
                  colSpan={4}
                  style={{ height: paddingTop, padding: 0, border: 0 }}
                />
              </Table.Tr>
            )}
            {virtualItems.map((virtualRow) => {
              const cosplayer = activeCosplayers[virtualRow.index];
              return (
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
              );
            })}
            {paddingBottom > 0 && (
              <Table.Tr>
                <Table.Td
                  colSpan={4}
                  style={{ height: paddingBottom, padding: 0, border: 0 }}
                />
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>

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
