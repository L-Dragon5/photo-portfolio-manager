import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import AdminLayout from './components/AdminLayout';
import AddAlbum from './forms/AddAlbum';
import EditAlbum from './forms/EditAlbum';

const Index = ({ albums, events }) => {
  const [modifyAlbum, setModifyAlbum] = useState(null);

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
    router.post(
      `/admin/album/destroy`,
      {
        id: modifyAlbum?.id,
      },
      {
        onSuccess: () => {
          reloadPage();
          onAlertClose();
        },
      },
    );
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
      <SimpleGrid minChildWidth="350px" spacing="12px" w="full">
        {albums?.map((album) => (
          <LinkBox key={album.id} rounded="md" position="relative">
            <Image src={album.cover_image} alt={album.name} rounded="md" />
            <LinkOverlay as={Link} href={`/${album.url_alias}/`}>
              <Heading
                size="sm"
                position="absolute"
                bottom="0"
                textAlign="center"
              >
                {album.name}
              </Heading>
            </LinkOverlay>
            <HStack>
              <IconButton
                aria-label="Edit album"
                icon={<EditIcon />}
                onClick={(e) =>
                  onEditClick(e, { id: album.id, name: album.name })
                }
              />
              <IconButton
                aria-label="Delete album"
                icon={<DeleteIcon />}
                onClick={(e) =>
                  onDeleteClick(e, { id: album.id, name: album.name })
                }
              />
            </HStack>
          </LinkBox>
        ))}
      </SimpleGrid>

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
                onClose={onModalClose}
                events={events}
              />
            ) : (
              <AddAlbum
                reloadPage={reloadPage}
                onClose={onModalClose}
                events={events}
              />
            )}
          </ModalBody>
          <ModalCloseButton />
        </ModalContent>
      </Modal>

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
