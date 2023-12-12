import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  StarIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  IconButton,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import AdminLayout from './components/AdminLayout';
import AddAlbum from './forms/AddAlbum';
import EditAlbum from './forms/EditAlbum';
import UploadAlbum from './forms/UploadAlbum';

const Index = ({ albums, events }) => {
  const [modifyAlbum, setModifyAlbum] = useState(null);
  const [drawerUploadType, setDrawerUploadType] = useState(null);

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const cancelRef = useRef();

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
    onAlertOpen();
  };

  const handleDelete = () => {
    router.delete(`/admin/albums/${modifyAlbum.id}`, {
      onSuccess: () => {
        reloadPage();
        onAlertClose();
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
      <HStack justifyContent="space-between" w="full">
        <Heading size="lg">Albums</Heading>
        <Button
          leftIcon={<AddIcon />}
          variant="solid"
          colorScheme="teal"
          onClick={onModalOpen}
        >
          Add Album
        </Button>
      </HStack>
      <TableContainer overflowY="auto" maxH="95%">
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Event</Th>
              <Th>URL Alias</Th>
              <Th>Password</Th>
              <Th>Flags</Th>
              <Th>Options</Th>
            </Tr>
          </Thead>
          <Tbody>
            {albums?.map((album) => (
              <Tr key={album.id}>
                <Td>{album.name}</Td>
                <Td>{album?.event?.name}</Td>
                <Td>{album.url_alias}</Td>
                <Td>{album.password}</Td>
                <Td>
                  {album.is_press ? (
                    <Badge colorScheme="purple" variant="subtle">
                      Press
                    </Badge>
                  ) : null}{' '}
                  {album.is_public ? (
                    <Badge colorScheme="green" variant="solid">
                      Public
                    </Badge>
                  ) : null}
                  {album?.related_photos?.length > 0 ? (
                    <Popover>
                      <PopoverTrigger>
                        <Badge
                          colorScheme="pink"
                          variant="solid"
                          cursor="pointer"
                        >
                          Previews Selected
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverHeader>Selected filenames</PopoverHeader>
                        <PopoverBody>
                          <UnorderedList h="200px" overflow="auto">
                            {album.related_photos.map((photo) => (
                              <ListItem key={photo.id}>{photo.name}</ListItem>
                            ))}
                          </UnorderedList>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                </Td>

                <Td>
                  <HStack>
                    {!album.is_public ||
                    album?.photos?.length < 1 ||
                    album?.previews?.length > 0 ? (
                      <Tooltip label="Upload previews">
                        <IconButton
                          label="Upload Previews"
                          aria-label="Upload previews"
                          icon={<ViewIcon />}
                          onClick={(e) => onUploadPreviewsClick(e, album)}
                        />
                      </Tooltip>
                    ) : null}

                    <Tooltip label="Upload displayed photos">
                      <IconButton
                        aria-label="Upload displayed photos"
                        icon={<StarIcon />}
                        onClick={(e) => onUploadPhotosClick(e, album)}
                      />
                    </Tooltip>
                    <Tooltip label="Edit album details">
                      <IconButton
                        aria-label="Edit album details"
                        icon={<EditIcon />}
                        onClick={(e) => onEditClick(e, album)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete album">
                      <IconButton
                        aria-label="Delete album"
                        icon={<DeleteIcon />}
                        onClick={(e) => onDeleteClick(e, album)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        closeOnOverlayClick={false}
        scrollBehavior="inside"
        size="5xl"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>
            {modifyAlbum !== null
              ? `Edit Album - ${modifyAlbum.name}`
              : 'Add Album'}
          </ModalHeader>
          <ModalBody>
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
          </ModalBody>
          <ModalCloseButton />
        </ModalContent>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        placement="bottom"
        onClose={handleDrawerClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            Upload {drawerUploadType} - {modifyAlbum?.name}
          </DrawerHeader>
          <DrawerBody>
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Album - {modifyAlbum?.name}
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

Index.layout = (page) => <AdminLayout title="All Albums">{page}</AdminLayout>;

export default Index;
