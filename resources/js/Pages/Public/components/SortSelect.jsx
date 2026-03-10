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
      top: 0,
      zIndex: 10,
      backgroundColor: 'var(--mantine-color-body)',
      paddingBottom: 'var(--mantine-spacing-md)',
      paddingTop: 'var(--mantine-spacing-xs)',
    }}
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
