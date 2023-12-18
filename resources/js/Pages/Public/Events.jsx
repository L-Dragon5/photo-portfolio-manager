import {
  Heading,
  LinkBox,
  LinkOverlay,
  Select,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import BaseLayout from './components/BaseLayout';

const Events = ({ events }) => {
  const [sortingOption, setSortingOption] = useState('date-desc');
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
        spacingY="24px"
        w="full"
      >
        {activeEvents?.map((event) => (
          <LinkBox
            key={event.id}
            rounded="md"
            position="relative"
            p={4}
            _hover={{ bg: useColorModeValue('blue.200', 'blue.800') }}
          >
            <LinkOverlay
              as={Link}
              href={`/events/${event?.url_alias ? event.url_alias : event.id}/`}
            >
              <Heading size="md" textAlign="center">
                {event.name}
              </Heading>
              <Heading size="xs" textAlign="center">
                {[
                  event.start_date &&
                    new Date(event.start_date).toLocaleDateString(),
                  event.end_date &&
                    new Date(event.end_date).toLocaleDateString(),
                ]
                  .filter((n) => n)
                  .join(' - ')}
              </Heading>
            </LinkOverlay>
          </LinkBox>
        ))}
      </SimpleGrid>
    </>
  );
};

Events.layout = (page) => <BaseLayout title="Events">{page}</BaseLayout>;

export default Events;
