import { Box, Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name - A to Z' },
  { value: 'name-desc', label: 'Name - Z to A' },
  { value: 'date-asc', label: 'Date - Oldest to Recent' },
  { value: 'date-desc', label: 'Date - Recent to Oldest' },
];

const SortSelect = ({ value, onChange, search, onSearchChange }) => (
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
      {onSearchChange && (
        <TextInput
          placeholder="Search by name..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
      )}
      <Select value={value} onChange={onChange} data={SORT_OPTIONS} />
    </Group>
  </Box>
);

export default SortSelect;
