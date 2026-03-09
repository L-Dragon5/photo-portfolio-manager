import { Link, usePage } from '@inertiajs/react';
import {
  ActionIcon,
  Box,
  CloseButton,
  Drawer,
  Flex,
  Image,
  NavLink,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons-react';

const LinkItems = [
  { name: 'Featured', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'On-Location', href: '/on-location' },
  { name: 'Press', href: '/press' },
];

function SidebarNav() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Box
        visibleFrom="md"
        bg="var(--mantine-color-body)"
        style={{ position: 'sticky', top: 0, zIndex: 3 }}
      >
        <SidebarContent onClose={close} />
      </Box>
      <Drawer
        opened={opened}
        onClose={close}
        placement="left"
        size="full"
        hiddenFrom="md"
      >
        <SidebarContent onClose={close} />
      </Drawer>
      <MobileNav hiddenFrom="md" onOpen={open} />
    </>
  );
}

const SidebarContent = ({ onClose }) => {
  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const { url } = usePage();

  return (
    <Flex
      direction="column"
      style={{
        borderRight: '1px solid var(--mantine-color-default-border)',
        width: '240px',
        position: 'fixed',
        height: '100%',
      }}
      bg="var(--mantine-color-body)"
    >
      <Flex h={150} align="center" justify="space-between" px="lg">
        <Image
          src={
            computedColorScheme === 'light'
              ? 'https://ldragonphotographymedia.s3.amazonaws.com/public/ldragon-full-black.png'
              : 'https://ldragonphotographymedia.s3.amazonaws.com/public/ldragon-full-white.png'
          }
          alt="logo"
          w="100%"
        />
        <CloseButton hiddenFrom="md" onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavLink
          key={link.name}
          component={Link}
          href={link.href}
          label={link.name}
          active={
            (link.href === '/' && url === link.href) ||
            (link.href !== '/' && url.startsWith(link.href))
          }
          color="indigo"
          py="md"
          styles={{
            label: {
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        />
      ))}

      <Box style={{ flex: 1 }} />
      <Box p="sm">
        <ActionIcon onClick={toggleColorScheme} variant="default" size="lg">
          {computedColorScheme === 'light' ? (
            <IconMoon size={16} />
          ) : (
            <IconSun size={16} />
          )}
        </ActionIcon>
      </Box>
    </Flex>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      px="md"
      h={64}
      align="center"
      bg="var(--mantine-color-body)"
      style={{
        boxShadow: 'var(--mantine-shadow-md)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
      {...rest}
    >
      <ActionIcon variant="default" onClick={onOpen} aria-label="open menu">
        <IconMenu2 size={16} />
      </ActionIcon>

      <Text fz="xl" ml="md" ff="monospace" fw="bold">
        L-Dragon Photography
      </Text>
    </Flex>
  );
};

export default SidebarNav;
