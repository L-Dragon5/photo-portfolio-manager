import {
  Heading,
  LinkBox,
  LinkOverlay,
  Select,
  SimpleGrid,
  Spacer,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import BaseLayout from './components/BaseLayout';

const Events = ({ events }) => {
  const [sortingOption, setSortingOption] = useState('date-desc');
  const [activeEvents, setActiveEvents] = useState(events);

  useEffect(() => {
    if (sortingOption === 'date-desc') {
      setActiveEvents(events);
    } else if (sortingOption === 'date-asc') {
      setActiveEvents(events.toReversed());
    } else if (sortingOption === 'name-asc') {
      setActiveEvents(
        events.toSorted((a, b) =>
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
        ),
      );
    } else if (sortingOption === 'name-desc') {
      setActiveEvents(
        events.toSorted((a, b) =>
          b.name.localeCompare(a.name, 'en', { sensitivity: 'base' }),
        ),
      );
    }
  }, [sortingOption]);

  return (
    <>
      <Select
        defaultValue={sortingOption}
        mb={4}
        onChange={(e) => setSortingOption(e.target.value)}
      >
        <option value="name-asc">Name - A to Z</option>
        <option value="name-desc">Name - Z to A</option>
        <option value="date-asc">Date - Oldest to Recent</option>
        <option value="date-desc">Date - Recent to Oldest</option>
      </Select>
      <SimpleGrid
        minChildWidth="250px"
        spacingX="12px"
        spacingY="18px"
        w="full"
      >
        {activeEvents?.map((event) => (
          <LinkBox
            key={event.id}
            rounded="md"
            position="relative"
            p={4}
            _hover={{ bg: useColorModeValue('blue.200', 'blue.800') }}
            border="1px solid"
            borderColor={useColorModeValue('gray.300', 'gray.600')}
          >
            <LinkOverlay
              as={Link}
              href={`/events/${event?.url_alias ? event.url_alias : event.id}/`}
              preserveScroll
            >
              <VStack h="full">
                <Heading size="md" textAlign="center" fontWeight="600">
                  {event.name}
                </Heading>
                <Heading size="xs" textAlign="center" fontWeight="400">
                  {[
                    event.start_date &&
                      new Date(event.start_date).toLocaleDateString(),
                    event.end_date &&
                      new Date(event.end_date).toLocaleDateString(),
                  ]
                    .filter((n) => n)
                    .join(' - ')}
                </Heading>
                <Spacer />
                <Heading size="sm" textAlign="center" mt={4} fontWeight="500">
                  {event.albums_count} albums
                </Heading>
              </VStack>
            </LinkOverlay>
          </LinkBox>
        ))}
      </SimpleGrid>
    </>
  );
};

Events.layout = (page) => <BaseLayout title="Events">{page}</BaseLayout>;

export default Events;
