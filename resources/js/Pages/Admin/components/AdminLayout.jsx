import { Head } from '@inertiajs/react';
import { Box, Flex } from '@mantine/core';

import AdminSidebarNav from './AdminSidebarNav';

const AdminLayout = ({ title, children }) => {
  return (
    <>
      <Head title={`${title} | Admin Panel`} />
      <Flex h="100vh" w="100vw" direction={{ base: 'column', md: 'row' }}>
        <AdminSidebarNav />
        <Box
          bg="var(--mantine-color-body)"
          ml={{ base: 0, md: '240px' }}
          w="100%"
          p="md"
          style={{ overflowY: 'auto' }}
        >
          {children}
        </Box>
      </Flex>
    </>
  );
};

export default AdminLayout;
