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
import AddEvent from './forms/AddEvent';
import EditEvent from './forms/EditEvent';

const Events = ({ events }) => {
  const [sortingOption, setSortingOption] = useState('name-asc');
  const [activeEvents, setActiveEvents] = useState(events);
  const [modifyEvent, setModifyEvent] = useState(null);

  useEffect(() => {
    if (sortingOption === 'name-asc') {
      setActiveEvents(events);
    } else if (sortingOption === 'name-desc') {
      setActiveEvents(events.toReversed());
    } else if (sortingOption === 'date-asc') {
      setActiveEvents(
        events.toSorted(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
        ),
      );
    } else if (sortingOption === 'date-desc') {
      setActiveEvents(
        events.toSorted(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
        ),
      );
    }
  }, [sortingOption]);

  useEffect(() => {
    setActiveEvents(events);
  }, [events]);

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
    onAlertOpen();
  };

  const handleDelete = () => {
    router.delete(`/admin/events/${modifyEvent.id}`, {
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
          <option value="date-asc">Date - Oldest to Recent</option>
          <option value="date-desc">Date - Recent to Oldest</option>
        </Select>
        <Button
          colorScheme="teal"
          leftIcon={<AddIcon />}
          w="50%"
          onClick={onModalOpen}
        >
          Add Event
        </Button>
      </HStack>

      <TableContainer overflowY="auto" maxH="95%">
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>URL Alias</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Options</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeEvents?.map((event) => (
              <Tr key={event.id}>
                <Td>{event.name}</Td>
                <Td>{event?.url_alias ?? 'N/A'}</Td>
                <Td>
                  {event.start_date &&
                    new Date(event.start_date).toLocaleDateString()}
                </Td>
                <Td>
                  {event.end_date &&
                    new Date(event.end_date).toLocaleDateString()}
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Edit event"
                      icon={<EditIcon />}
                      onClick={(e) => onEditClick(e, event)}
                    />
                    <IconButton
                      aria-label="Delete event"
                      icon={<DeleteIcon />}
                      onClick={(e) => onDeleteClick(e, event)}
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
            {modifyEvent !== null
              ? `Edit Event - ${modifyEvent.name}`
              : 'Add Event'}
          </ModalHeader>
          <ModalBody>
            {modifyEvent !== null ? (
              <EditEvent
                reloadPage={reloadPage}
                onClose={onModalClose}
                event={modifyEvent}
              />
            ) : (
              <AddEvent reloadPage={reloadPage} onClose={onModalClose} />
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
              Delete Event - {modifyEvent?.name}
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

Events.layout = (page) => <AdminLayout title="All Events">{page}</AdminLayout>;

export default Events;
