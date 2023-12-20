import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Head } from '@inertiajs/react';

import SidebarNav from './SidebarNav';

const BaseLayout = ({ title, children }) => {
  return (
    <>
      <Head title={`${title} | L-Dragon Photography`} />
      <Flex h="100vh" w="100vw" direction={{ base: 'column', md: 'row' }}>
        <SidebarNav />
        <Box
          bg={useColorModeValue('gray.50', 'gray.800')}
          ml={{ base: 0, md: 60 }}
          w="full"
          p={4}
          overflowY="auto"
          h="full"
          scroll-region="true"
        >
          {children}
        </Box>
      </Flex>
    </>
  );
};

export default BaseLayout;
