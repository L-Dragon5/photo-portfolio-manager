import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Head } from '@inertiajs/react';
import React from 'react';

import AdminSidebarNav from './AdminSidebarNav';

const AdminLayout = ({ title, children }) => {
  return (
    <>
      <Head title={`${title} | Admin Panel`} />
      <Flex h="100vh" w="100vw" direction={{ base: 'column', md: 'row' }}>
        <AdminSidebarNav />
        <Box
          bg={useColorModeValue('gray.50', 'gray.800')}
          ml={{ base: 0, md: 60 }}
          w="full"
          p={4}
          overflowY="auto"
        >
          {children}
        </Box>
      </Flex>
    </>
  );
};

export default AdminLayout;
