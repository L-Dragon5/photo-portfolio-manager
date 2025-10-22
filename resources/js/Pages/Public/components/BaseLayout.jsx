import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Head } from '@inertiajs/react';

import SidebarNav from './SidebarNav';

const BaseLayout = ({ title, children }) => {
  return (
    <>
      <Head title={`${title} | L-Dragon Photography`} />
      <Flex h="100dvh" w="100dvw" direction={{ base: 'column', md: 'row' }}>
        <SidebarNav />
        <Box
          bg={useColorModeValue('gray.50', 'gray.800')}
          ml={{ base: 0, md: 60 }}
          p={4}
          overflowY="auto"
          scroll-region="true"
          flexGrow="1"
        >
          {children}
        </Box>
      </Flex>
    </>
  );
};

export default BaseLayout;
