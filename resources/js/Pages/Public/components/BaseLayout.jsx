import { Head } from '@inertiajs/react';
import { ActionIcon, Box, Flex } from '@mantine/core';
import { IconChevronUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import SidebarNav from './SidebarNav';

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
        style={{ minHeight: '100dvh' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <SidebarNav />
        <Box
          bg="var(--mantine-color-body)"
          ml={{ base: 0, md: '240px' }}
          p="md"
          data-scroll-region="true"
          style={{ flexGrow: 1 }}
        >
          {children}
        </Box>

        {isVisible && (
          <ActionIcon
            color="blue"
            variant="filled"
            radius="xl"
            size="xl"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '16px',
              zIndex: 5,
            }}
            aria-label="Back to top of page"
            onClick={scrollToTop}
          >
            <IconChevronUp size={24} />
          </ActionIcon>
        )}
      </Flex>
    </>
  );
};

export default BaseLayout;
