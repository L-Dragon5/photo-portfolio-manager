import { Link } from '@inertiajs/react';
import { Anchor, Box, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

import BaseLayout from './components/BaseLayout';
import SortSelect from './components/SortSelect';

const Events = ({ events }) => {
  const [sortingOption, setSortingOption] = useState('date-desc');
  const [search, setSearch] = useState('');
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

  const visibleEvents = search
    ? activeEvents.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()),
      )
    : activeEvents;

  return (
    <>
      <SortSelect
        value={sortingOption}
        onChange={(val) => setSortingOption(val ?? 'date-desc')}
        search={search}
        onSearchChange={setSearch}
      />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="md">
        {visibleEvents?.map((event) => (
          <Anchor
            key={event.id}
            component={Link}
            href={`/events/${event?.url_alias ? event.url_alias : event.id}/`}
            style={{
              textDecoration: 'none',
              color: 'light-dark(black, white)',
            }}
          >
            <Box
              p="md"
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid var(--mantine-color-default-border)',
                height: '100%',
              }}
              styles={{
                root: {
                  '&:hover': { backgroundColor: 'var(--mantine-color-blue-2)' },
                },
              }}
            >
              <Stack h="100%" justify="space-between" gap="xs">
                <Title order={4} ta="center" fw={600}>
                  {event.name}
                </Title>
                <Text size="md" ta="center" fw={400}>
                  {[
                    event.start_date &&
                      new Date(
                        event.start_date + 'T00:00:00',
                      ).toLocaleDateString(),
                    event.end_date &&
                      new Date(
                        event.end_date + 'T00:00:00',
                      ).toLocaleDateString(),
                  ]
                    .filter((n) => n)
                    .join(' - ')}
                </Text>
                <Box style={{ flex: 1 }} />
                <Title order={5} ta="center" fw={500} mt="md">
                  {event.albums_count} albums
                </Title>
              </Stack>
            </Box>
          </Anchor>
        ))}
      </SimpleGrid>
    </>
  );
};

Events.layout = (page) => <BaseLayout title="Events">{page}</BaseLayout>;

export default Events;
