import { router } from '@inertiajs/react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Image,
  Modal,
  ScrollArea,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';

import AdminLayout from './components/AdminLayout';
import AddVideo from './forms/AddVideo';
import EditVideo from './forms/EditVideo';

const Videos = ({ videos, albums }) => {
  const [modifyVideo, setModifyVideo] = useState(null);

  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: videos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 10,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  const [isModalOpen, { open: onModalOpen, close: onModalClose }] =
    useDisclosure(false);

  const reloadPage = () => {
    router.reload({
      only: ['videos'],
    });
  };

  const handleModalClose = () => {
    onModalClose();
    setModifyVideo(null);
  };

  const onEditClick = (videoObj) => {
    setModifyVideo(videoObj);
    onModalOpen();
  };

  const onDeleteClick = (videoObj) => {
    modals.openConfirmModal({
      title: `Delete Video - ${videoObj.title}`,
      children: "Are you sure? You can't undo this action afterwards.",
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        router.delete(`/admin/videos/${videoObj.id}`, {
          onSuccess: () => reloadPage(),
        });
      },
    });
  };

  return (
    <>
      <Group mb="md" justify="flex-end">
        <Button
          color="teal"
          leftSection={<IconPlus size={14} />}
          onClick={onModalOpen}
        >
          Add Video
        </Button>
      </Group>

      <div
        ref={parentRef}
        style={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}
      >
        <Table style={{ minWidth: 800, tableLayout: 'fixed' }}>
          <Table.Thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: 'var(--mantine-color-body)',
            }}
          >
            <Table.Tr>
              <Table.Th style={{ width: 110 }}>Thumbnail</Table.Th>
              <Table.Th style={{ width: 280 }}>Title</Table.Th>
              <Table.Th style={{ width: 200 }}>Album</Table.Th>
              <Table.Th style={{ width: 120 }}>Date</Table.Th>
              <Table.Th style={{ width: 90 }}>Public</Table.Th>
              <Table.Th style={{ width: 90 }}>Options</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paddingTop > 0 && (
              <Table.Tr>
                <Table.Td
                  colSpan={6}
                  style={{ height: paddingTop, padding: 0, border: 0 }}
                />
              </Table.Tr>
            )}
            {virtualItems.map((virtualRow) => {
              const video = videos[virtualRow.index];
              return (
                <Table.Tr key={video.id}>
                  <Table.Td>
                    <Image
                      src={video.thumbnail_url}
                      alt=""
                      w={90}
                      h={50}
                      fit="cover"
                      radius="sm"
                    />
                  </Table.Td>
                  <Table.Td>{video.title}</Table.Td>
                  <Table.Td>{video.album?.name ?? 'Standalone'}</Table.Td>
                  <Table.Td>{video.date_taken?.slice(0, 10) ?? 'N/A'}</Table.Td>
                  <Table.Td>
                    <Badge color={video.is_public ? 'green' : 'gray'}>
                      {video.is_public ? 'Yes' : 'No'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        aria-label="Edit video"
                        onClick={() => onEditClick(video)}
                        variant="default"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        aria-label="Delete video"
                        onClick={() => onDeleteClick(video)}
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
                  colSpan={6}
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
          modifyVideo !== null
            ? `Edit Video - ${modifyVideo.title}`
            : 'Add Video'
        }
      >
        {modifyVideo !== null ? (
          <EditVideo
            reloadPage={reloadPage}
            onClose={handleModalClose}
            albums={albums}
            video={modifyVideo}
          />
        ) : (
          <AddVideo
            reloadPage={reloadPage}
            onClose={handleModalClose}
            albums={albums}
          />
        )}
      </Modal>
    </>
  );
};

Videos.layout = (page) => <AdminLayout title="All Videos">{page}</AdminLayout>;

export default Videos;
