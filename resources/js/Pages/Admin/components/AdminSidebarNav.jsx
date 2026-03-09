import { Link, usePage } from '@inertiajs/react';
import {
  ActionIcon,
  Box,
  CloseButton,
  Drawer,
  Flex,
  Text,
  Title,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons-react';

const LinkItems = [
  { name: 'All Albums', href: '/admin' },
  { name: 'All Events', href: '/admin/events' },
  { name: 'All Cosplayers', href: '/admin/cosplayers' },
];

function AdminSidebarNav() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Box visibleFrom="md">
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
      <Flex h={80} align="center" justify="space-between" px="lg">
        <Title order={4}>Admin Panel</Title>
        <CloseButton hiddenFrom="md" onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} href={link.href}>
          {link.name}
        </NavItem>
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

const NavItem = ({ href, children }) => {
  const { url } = usePage();
  const isActive = url === href;

  return (
    <UnstyledButton
      component={Link}
      href={href}
      p="sm"
      mx="sm"
      style={{
        borderRadius: 'var(--mantine-radius-md)',
        textDecoration: 'none',
      }}
      bg={isActive ? 'cyan.3' : undefined}
      data-active={isActive || undefined}
      styles={{
        root: {
          '&:hover': {
            backgroundColor: 'var(--mantine-color-cyan-4)',
            color: 'white',
          },
        },
      }}
    >
      <Text>{children}</Text>
    </UnstyledButton>
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

      <Text fz="2xl" ml="md" ff="monospace" fw="bold">
        Admin Panel
      </Text>
    </Flex>
  );
};

export default AdminSidebarNav;
