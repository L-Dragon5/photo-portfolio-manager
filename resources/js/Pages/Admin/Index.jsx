import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
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

  console.log(albums);

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
    router.delete(`/admin/albums/${modifyAlbum.id}`, {
      onSuccess: () => {
        reloadPage();
        onAlertClose();
      },
    });
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
      <SimpleGrid minChildWidth="350px" spacing="12px" w="full" mt={4}>
        {albums?.map((album) => (
          <Box
            key={album.id}
            rounded="md"
            position="relative"
            bgColor="gray.200"
            minH="100px"
          >
            {/*
            <Image
              alt={album.name}
              rounded="md"
              {...album?.cover_image?.html}
              maxH="400px"
            />
            */}
            <Heading size="sm" textAlign="left">
              {album.name}
            </Heading>
            <Box
              opacity={0}
              _hover={{ opacity: 1 }}
              transition="all 0.3s"
              height="full"
              width="full"
            >
              <HStack
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
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
            </Box>
          </Box>
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
