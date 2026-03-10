import { router } from '@inertiajs/react';
import {
  ActionIcon,
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
import AddEvent from './forms/AddEvent';
import EditEvent from './forms/EditEvent';

const Events = ({ events }) => {
  const [sortingOption, setSortingOption] = useState('name-asc');
  const [activeEvents, setActiveEvents] = useState(events);
  const [modifyEvent, setModifyEvent] = useState(null);

  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: activeEvents.length,
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
      setActiveEvents(events);
    } else if (sortingOption === 'name-desc') {
      setActiveEvents(events.toReversed());
    } else if (sortingOption === 'date-asc') {
      setActiveEvents(
        events.toSorted(
          (a, b) =>
            new Date(a.start_date + 'T00:00:00').getTime() - new Date(b.start_date + 'T00:00:00').getTime(),
        ),
      );
    } else if (sortingOption === 'date-desc') {
      setActiveEvents(
        events.toSorted(
          (a, b) =>
            new Date(b.start_date + 'T00:00:00').getTime() - new Date(a.start_date + 'T00:00:00').getTime(),
        ),
      );
    }
  }, [sortingOption]);

  useEffect(() => {
    setActiveEvents(events);
  }, [events]);

  const [isModalOpen, { open: onModalOpen, close: onModalClose }] =
    useDisclosure(false);

  const reloadPage = () => {
    router.reload({
      only: ['events'],
    });
  };

  const handleModalClose = () => {
    onModalClose();
    setModifyEvent(null);
  };

  const onEditClick = (e, eventObj) => {
    setModifyEvent(eventObj);
    onModalOpen();
  };

  const onDeleteClick = (e, eventObj) => {
    setModifyEvent(eventObj);
    modals.openConfirmModal({
      title: `Delete Event - ${eventObj.name}`,
      children: "Are you sure? You can't undo this action afterwards.",
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        router.delete(`/admin/events/${eventObj.id}`, {
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
            { value: 'date-asc', label: 'Date - Oldest to Recent' },
            { value: 'date-desc', label: 'Date - Recent to Oldest' },
          ]}
          style={{ flex: 1 }}
        />
        <Button
          color="teal"
          leftSection={<IconPlus size={14} />}
          w="50%"
          onClick={onModalOpen}
        >
          Add Event
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
              <Table.Th>URL Alias</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Options</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paddingTop > 0 && (
              <Table.Tr>
                <Table.Td
                  colSpan={5}
                  style={{ height: paddingTop, padding: 0, border: 0 }}
                />
              </Table.Tr>
            )}
            {virtualItems.map((virtualRow) => {
              const event = activeEvents[virtualRow.index];
              return (
                <Table.Tr key={event.id}>
                  <Table.Td>{event.name}</Table.Td>
                  <Table.Td>{event?.url_alias ?? 'N/A'}</Table.Td>
                  <Table.Td>
                    {event.start_date &&
                      new Date(event.start_date + 'T00:00:00').toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    {event.end_date &&
                      new Date(event.end_date + 'T00:00:00').toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        aria-label="Edit event"
                        onClick={(e) => onEditClick(e, event)}
                        variant="default"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        aria-label="Delete event"
                        onClick={(e) => onDeleteClick(e, event)}
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
                  colSpan={5}
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
          modifyEvent !== null
            ? `Edit Event - ${modifyEvent.name}`
            : 'Add Event'
        }
      >
        {modifyEvent !== null ? (
          <EditEvent
            reloadPage={reloadPage}
            onClose={onModalClose}
            event={modifyEvent}
          />
        ) : (
          <AddEvent reloadPage={reloadPage} onClose={onModalClose} />
        )}
      </Modal>
    </>
  );
};

Events.layout = (page) => <AdminLayout title="All Events">{page}</AdminLayout>;

export default Events;
