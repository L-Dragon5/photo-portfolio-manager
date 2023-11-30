import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  HStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
    onAlertOpen();
  };

  const handleDelete = () => {
    router.delete(`/admin/cosplayers/${modifyCosplayer.id}`, {
      onSuccess: () => {
        reloadPage();
        onAlertClose();
      },
    });
  };

  return (
    <>
      <HStack mb={4}>
        <Select
          defaultValue={sortingOption}
          onChange={(e) => setSortingOption(e.target.value)}
        >
          <option value="name-asc">Name - A to Z</option>
          <option value="name-desc">Name - Z to A</option>
        </Select>
        <Button
          colorScheme="teal"
          leftIcon={<AddIcon />}
          w="50%"
          onClick={onModalOpen}
        >
          Add Cosplayer
        </Button>
      </HStack>

      <TableContainer overflowY="auto" maxH="95%">
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Instagram</Th>
              <Th>Twitter</Th>
              <Th>Options</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeCosplayers?.map((cosplayer) => (
              <Tr key={cosplayer.id}>
                <Td>{cosplayer.name}</Td>
                <Td>
                  {cosplayer?.instagram ? (
                    <Link
                      href={`https://instagram.com/${cosplayer.instagram}`}
                      isExternal
                    >
                      {cosplayer.instagram}
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </Td>
                <Td>
                  {cosplayer?.twitter ? (
                    <Link
                      href={`https://x.com/${cosplayer.twitter}`}
                      isExternal
                    >
                      {cosplayer.twitter}
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Edit cosplayer"
                      icon={<EditIcon />}
                      onClick={(e) => onEditClick(e, cosplayer)}
                    />
                    <IconButton
                      aria-label="Delete cosplayer"
                      icon={<DeleteIcon />}
                      onClick={(e) => onDeleteClick(e, cosplayer)}
                    />
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
            {modifyCosplayer !== null
              ? `Edit Cosplayer - ${modifyCosplayer.name}`
              : 'Add Cosplayer'}
          </ModalHeader>
          <ModalBody>
            {modifyCosplayer !== null ? (
              <EditCosplayer
                reloadPage={reloadPage}
                onClose={onModalClose}
                cosplayer={modifyCosplayer}
              />
            ) : (
              <AddCosplayer reloadPage={reloadPage} onClose={onModalClose} />
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
              Delete Cosplayer - {modifyCosplayer?.name}
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

Cosplayers.layout = (page) => (
  <AdminLayout title="All Cosplayers">{page}</AdminLayout>
);

export default Cosplayers;
