import { AddIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  Heading,
  HStack,
  IconButton,
  Select,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AdminLayout from './components/AdminLayout';

const Events = ({ events }) => {
  const [sortingOption, setSortingOption] = useState('name-asc');
  const [activeEvents, setActiveEvents] = useState(events);

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
        <Button colorScheme="teal" leftIcon={<AddIcon />} w="50%">
          Add Event
        </Button>
      </HStack>

      <TableContainer overflowY="auto" maxH="95%">
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeEvents?.map((event) => (
              <Tr>
                <Td>{event.name}</Td>
                <Td>
                  {event.start_date &&
                    new Date(event.start_date).toLocaleDateString()}
                </Td>
                <Td>
                  {event.end_date &&
                    new Date(event.end_date).toLocaleDateString()}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

Events.layout = (page) => <AdminLayout title="All Events">{page}</AdminLayout>;

export default Events;
