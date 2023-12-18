import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  LinkBox,
  LinkOverlay,
  Select,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PhotoAlbum from 'react-photo-album';

import BaseLayout from './components/BaseLayout';

const SingleEvent = ({ event, albums }) => {
  const [sortingOption, setSortingOption] = useState('name-asc');
  const [activeAlbums, setActiveAlbums] = useState(albums);

  useEffect(() => {
    if (sortingOption === 'name-asc') {
      setActiveAlbums(albums);
    } else if (sortingOption === 'name-desc') {
      setActiveAlbums(albums.toReversed());
    } else if (sortingOption === 'date-asc') {
      setActiveAlbums(
        albums.toSorted(
          (a, b) =>
            new Date(a.date_taken).getTime() - new Date(b.date_taken).getTime(),
        ),
      );
    } else if (sortingOption === 'date-desc') {
      setActiveAlbums(
        albums.toSorted(
          (a, b) =>
            new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime(),
        ),
      );
    }
  }, [sortingOption]);

  const customRenderPhoto = ({ layout, wrapperStyle, renderDefaultPhoto }) => {
    const shoot = activeAlbums[layout.index];

    return (
      <LinkBox
        key={shoot.id}
        rounded="md"
        border="1px solid"
        borderColor="gray.300"
        transition="0.3s transform"
        _hover={{ transform: 'scale(1.025)' }}
        {...wrapperStyle}
      >
        <LinkOverlay
          as={Link}
          href={`/events/${event?.url_alias ? event.url_alias : event.id}/${
            shoot?.url_alias ? shoot.url_alias : shoot.id
          }/`}
        >
          <Box
            position="absolute"
            bottom={0}
            left={0}
            p={2}
            bgColor="blackAlpha.600"
            width="full"
          >
            <Heading size="md" color="gray.100">
              {shoot.name}
            </Heading>
            <Heading size="xs" color="gray.100">
              {shoot.date_taken &&
                new Date(shoot.date_taken).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </Heading>
          </Box>
        </LinkOverlay>
        {renderDefaultPhoto({ wrapped: true })}
      </LinkBox>
    );
  };

  return (
    <BaseLayout title={event.name}>
      <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/events">
            Events
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">{event.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Select
        defaultValue={sortingOption}
        my={4}
        onChange={(e) => setSortingOption(e.target.value)}
      >
        <option value="name-asc">Name - A to Z</option>
        <option value="name-desc">Name - Z to A</option>
        <option value="date-asc">Date - Oldest to Recent</option>
        <option value="date-desc">Date - Recent to Oldest</option>
      </Select>

      <PhotoAlbum
        layout="masonry"
        photos={activeAlbums?.map((album) => album?.cover_image?.html)}
        columns={(containerWidth) => {
          if (containerWidth <= 500) return 1;
          if (containerWidth < 600) return 2;
          if (containerWidth < 1200) return 2;
          if (containerWidth < 1450) return 3;
          if (containerWidth < 2800) return 4;
          return 5;
        }}
        renderPhoto={customRenderPhoto}
      />
    </BaseLayout>
  );
};

export default SingleEvent;
