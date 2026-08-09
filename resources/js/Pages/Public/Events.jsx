import { Link } from '@inertiajs/react';
import {
  Accordion,
  Anchor,
  Box,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import BaseLayout from './components/BaseLayout';
import groupEvents from './utils/groupEvents';

const GROUP_OPTIONS = [
  { value: 'year', label: 'Group by Year' },
  { value: 'event', label: 'Group by Event' },
];

const EventCard = ({ event }) => (
  <Anchor
    component={Link}
    href={`/events/${event?.url_alias ? event.url_alias : event.id}/`}
    style={{ textDecoration: 'none', color: 'light-dark(black, white)' }}
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
              new Date(event.start_date + 'T00:00:00').toLocaleDateString(),
            event.end_date &&
              new Date(event.end_date + 'T00:00:00').toLocaleDateString(),
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
);

const Events = ({ events }) => {
  const [groupBy, setGroupBy] = useState('year');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [opened, setOpened] = useState([]);

  const groups = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const matching = term
      ? events.filter((e) => e.name.toLowerCase().includes(term))
      : events;

    return groupEvents(matching, groupBy);
  }, [events, groupBy, debouncedSearch]);

  /** Searching is only useful if it shows the hits, so open every match. */
  const value = debouncedSearch.trim() ? groups.map((g) => g.label) : opened;

  return (
    <>
      <Box
        style={{
          position: 'sticky',
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
        }}
        top={{ base: 64, md: 0 }}
        pt="xs"
        pb="md"
        mx="-1rem"
        px="1rem"
      >
        <Group>
          <TextInput
            placeholder="Search by name..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            value={groupBy}
            onChange={(val) => {
              setGroupBy(val ?? 'year');
              setOpened([]);
            }}
            data={GROUP_OPTIONS}
            allowDeselect={false}
          />
        </Group>
      </Box>

      <Accordion
        multiple
        value={value}
        onChange={setOpened}
        variant="separated"
      >
        {groups.map((group) => (
          <Accordion.Item key={group.label} value={group.label}>
            <Accordion.Control>
              <Group justify="space-between" pr="sm">
                <Title order={4} fw={600}>
                  {group.label}
                </Title>
                <Text size="sm" c="dimmed">
                  {group.events.length}{' '}
                  {group.events.length === 1 ? 'event' : 'events'},{' '}
                  {group.albumCount}{' '}
                  {group.albumCount === 1 ? 'album' : 'albums'}
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="md">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {groups.length === 0 && (
        <Text c="dimmed" ta="center" mt="xl">
          No events match “{debouncedSearch}”.
        </Text>
      )}
    </>
  );
};

Events.layout = (page) => <BaseLayout title="Events">{page}</BaseLayout>;

export default Events;
