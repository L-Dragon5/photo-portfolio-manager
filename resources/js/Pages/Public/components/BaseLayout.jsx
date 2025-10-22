import { Box, Flex, IconButton, useColorModeValue } from '@chakra-ui/react';
import { Head } from '@inertiajs/react';

import SidebarNav from './SidebarNav';
import { ChevronUpIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

const BaseLayout = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      <Head title={`${title} | L-Dragon Photography`} />
      <Flex
        h="100%"
        w="100%"
        minH="100dvh"
        direction={{ base: 'column', md: 'row' }}
      >
        <SidebarNav />
        <Box
          bg={useColorModeValue('gray.50', 'gray.800')}
          ml={{ base: 0, md: 60 }}
          p={4}
          scroll-region="true"
          flexGrow="1"
        >
          {children}
        </Box>

        {isVisible && (
          <IconButton
            colorScheme="blue"
            variant="solid"
            isRound
            position="fixed"
            bottom="20px"
            right={['16px', '84px']}
            zIndex={5}
            aria-label="Back to top of page"
            icon={<ChevronUpIcon boxSize={8} />}
            onClick={scrollToTop}
          />
        )}
      </Flex>
    </>
  );
};

export default BaseLayout;
