import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  Icon,
  IconButton,
  Image,
  Spacer,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, usePage } from '@inertiajs/react';

const LinkItems = [
  { name: 'Featured', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'On-Location', href: '/on-location' },
  { name: 'Press', href: '/press' },
];

function SidebarNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'flex' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
    </Box>
  );
}

const SidebarContent = ({ onClose, ...rest }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      direction="column"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Image
          src="https://photo-portfolio-production-photoportfolioimages-zo958yhaaa6q.s3.amazonaws.com/logo-white.webp"
          alt="logo"
          width="full"
        />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} href={link.href} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}

      <Spacer />
      <IconButton onClick={toggleColorMode}>
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </IconButton>
    </Flex>
  );
};

const NavItem = ({ icon, href, children, ...rest }) => {
  const { url } = usePage();

  return (
    <Box
      as={Link}
      href={href}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={
          (href === '/' && url === href) ||
          (href !== '/' && url.startsWith(href))
            ? useColorModeValue('cyan.300', 'cyan.900')
            : null
        }
        _hover={{
          bg: useColorModeValue('cyan.400', 'cyan.800'),
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height={16}
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      boxShadow="md"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<HamburgerIcon />}
      />

      <Text fontSize="2xl" ml={4} fontFamily="monospace" fontWeight="bold">
        L-Dragon Photography
      </Text>
    </Flex>
  );
};

export default SidebarNav;
