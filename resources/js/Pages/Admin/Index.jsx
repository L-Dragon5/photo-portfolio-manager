import { Link, router } from '@inertiajs/react';
import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  Flex,
  Group,
  List,
  Modal,
  Popover,
  ScrollArea,
  Table,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconPencil,
  IconPlus,
  IconStar,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

import AdminLayout from './components/AdminLayout';
import AddAlbum from './forms/AddAlbum';
import EditAlbum from './forms/EditAlbum';
import UploadAlbum from './forms/UploadAlbum';

const Index = ({ albums, events }) => {
  const [modifyAlbum, setModifyAlbum] = useState(null);
  const [drawerUploadType, setDrawerUploadType] = useState(null);

  const [isModalOpen, { open: onModalOpen, close: onModalClose }] =
    useDisclosure(false);
  const [isDrawerOpen, { open: onDrawerOpen, close: onDrawerClose }] =
    useDisclosure(false);

  const reloadPage = () => {
    router.reload({
      only: ['albums'],
    });
  };

  const handleModalClose = () => {
    onModalClose();
    setModifyAlbum(null);
  };

  const handleDrawerClose = () => {
    onDrawerClose();
    setModifyAlbum(null);
  };

  const onEditClick = (e, albumObj) => {
    e.stopPropagation();
    setModifyAlbum(albumObj);
    onModalOpen();
  };

  const onDeleteClick = (e, albumObj) => {
    e.stopPropagation();
    setModifyAlbum(albumObj);
    modals.openConfirmModal({
      title: `Delete Album - ${albumObj.name}`,
      children: "Are you sure? You can't undo this action afterwards.",
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        router.delete(`/admin/albums/${albumObj.id}`, {
          onSuccess: () => reloadPage(),
        });
      },
    });
  };

  const onUploadPreviewsClick = (e, albumObj) => {
    e.stopPropagation();
    setDrawerUploadType('previews');
    setModifyAlbum(albumObj);
    onDrawerOpen();
  };
  const onUploadPhotosClick = (e, albumObj) => {
    e.stopPropagation();
    setDrawerUploadType('photos');
    setModifyAlbum(albumObj);
    onDrawerOpen();
  };

  return (
    <>
      <Group justify="space-between" w="100%" mb="md">
        <Title order={2}>Albums</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          color="teal"
          onClick={onModalOpen}
        >
          Add Album
        </Button>
      </Group>
      <Flex gap="xs" mb="sm">
        <ActionIcon
          component={albums?.current_page > 1 ? Link : 'button'}
          href={albums?.first_page_url}
          only={['albums']}
          variant="default"
          disabled={!(albums?.current_page > 1)}
        >
          <IconArrowLeft size={14} />
        </ActionIcon>
        <ActionIcon
          component={albums?.prev_page_url ? Link : 'button'}
          href={albums?.prev_page_url}
          only={['albums']}
          variant="default"
          disabled={!albums?.prev_page_url}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
        {albums?.links?.map((link, index) => {
          if (index === 0 || index === albums.links.length - 1) return;
          return (
            <Button
              key={`${link.label}-${index}`}
              component={link.url ? Link : 'button'}
              href={link.url ?? undefined}
              only={['albums']}
              color={link.active ? 'blue' : 'gray'}
              variant={link.active ? 'filled' : 'default'}
              disabled={!link.url}
              size="sm"
            >
              {link.label}
            </Button>
          );
        })}
        <ActionIcon
          component={albums?.next_page_url ? Link : 'button'}
          href={albums?.next_page_url}
          only={['albums']}
          variant="default"
          disabled={!albums?.next_page_url}
        >
          <IconChevronRight size={18} />
        </ActionIcon>
        <ActionIcon
          component={albums?.current_page < albums?.last_page ? Link : 'button'}
          href={albums?.last_page_url}
          only={['albums']}
          variant="default"
          disabled={!(albums?.current_page < albums?.last_page)}
        >
          <IconArrowRight size={14} />
        </ActionIcon>
      </Flex>
      <Table.ScrollContainer minWidth={800} mah="93%">
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Event</Table.Th>
              <Table.Th>Date Taken</Table.Th>
              <Table.Th>URL Alias</Table.Th>
              <Table.Th>Password</Table.Th>
              <Table.Th>Flags</Table.Th>
              <Table.Th>Options</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {albums?.data?.map((album) => (
              <Table.Tr key={album.id}>
                <Table.Td>{album.name}</Table.Td>
                <Table.Td>{album?.event?.name}</Table.Td>
                <Table.Td>{album?.date_taken}</Table.Td>
                <Table.Td>{album.url_alias}</Table.Td>
                <Table.Td>{album.password}</Table.Td>
                <Table.Td>
                  {album.is_press ? (
                    <Badge color="grape" variant="light">
                      Press
                    </Badge>
                  ) : null}{' '}
                  {album.is_public ? (
                    <Badge color="green" variant="filled">
                      Public
                    </Badge>
                  ) : null}
                  {album?.related_photos?.length > 0 ? (
                    <Popover>
                      <Popover.Target>
                        <Badge
                          color="pink"
                          variant="filled"
                          style={{ cursor: 'pointer' }}
                        >
                          Previews Selected
                        </Badge>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          Selected filenames
                        </div>
                        <ScrollArea h={200}>
                          <List>
                            {album.related_photos
                              .toSorted((a, b) =>
                                a.name.localeCompare(b.name, 'en'),
                              )
                              .map((photo) => (
                                <List.Item key={photo.id}>
                                  {photo.name}
                                </List.Item>
                              ))}
                          </List>
                        </ScrollArea>
                      </Popover.Dropdown>
                    </Popover>
                  ) : null}
                </Table.Td>

                <Table.Td>
                  <Group gap="xs">
                    {!album.is_public ||
                    album?.photos?.length < 1 ||
                    album?.previews?.length > 0 ? (
                      <Tooltip label="Upload previews">
                        <ActionIcon
                          aria-label="Upload previews"
                          onClick={(e) => onUploadPreviewsClick(e, album)}
                          variant="default"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                    ) : null}

                    <Tooltip label="Upload displayed photos">
                      <ActionIcon
                        aria-label="Upload displayed photos"
                        onClick={(e) => onUploadPhotosClick(e, album)}
                        variant="default"
                      >
                        <IconStar size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit album details">
                      <ActionIcon
                        aria-label="Edit album details"
                        onClick={(e) => onEditClick(e, album)}
                        variant="default"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete album">
                      <ActionIcon
                        aria-label="Delete album"
                        onClick={(e) => onDeleteClick(e, album)}
                        color="red"
                        variant="subtle"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
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
          modifyAlbum !== null
            ? `Edit Album - ${modifyAlbum.name}`
            : 'Add Album'
        }
      >
        {modifyAlbum !== null ? (
          <EditAlbum
            reloadPage={reloadPage}
            onClose={handleModalClose}
            events={events}
            album={modifyAlbum}
          />
        ) : (
          <AddAlbum
            reloadPage={reloadPage}
            onClose={handleModalClose}
            events={events}
          />
        )}
      </Modal>

      <Drawer
        opened={isDrawerOpen}
        position="bottom"
        onClose={handleDrawerClose}
        size="100%"
        title={`Upload ${drawerUploadType} - ${modifyAlbum?.name}`}
      >
        {drawerUploadType === 'previews' ? (
          <UploadAlbum
            reloadPage={reloadPage}
            onClose={handleDrawerClose}
            type="previews"
            album={modifyAlbum}
          />
        ) : (
          <UploadAlbum
            reloadPage={reloadPage}
            onClose={handleDrawerClose}
            type="photos"
            album={modifyAlbum}
          />
        )}
      </Drawer>
    </>
  );
};

Index.layout = (page) => <AdminLayout title="All Albums">{page}</AdminLayout>;

export default Index;
