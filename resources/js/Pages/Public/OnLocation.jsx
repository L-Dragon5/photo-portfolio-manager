import {
  Flex,
  Heading,
  LinkBox,
  LinkOverlay,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PhotoAlbum from 'react-photo-album';

import BaseLayout from './components/BaseLayout';

const OnLocation = ({ albums }) => {
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

  const customRenderPhoto = ({ layout, renderDefaultPhoto }) => {
    const shoot = activeAlbums[layout.index];

    return (
      <LinkBox
        key={shoot.id}
        rounded="md"
        border="1px solid"
        borderColor="gray.300"
        transition="0.3s transform"
        _hover={{ transform: 'scale(1.025)' }}
      >
        <LinkOverlay
          as={Link}
          href={`/on-location/${
            shoot?.url_alias ? shoot.url_alias : shoot.id
          }/`}
        >
          {renderDefaultPhoto()}

          <Flex
            flexDirection="column"
            alignItems="center"
            p={4}
            bgColor={useColorModeValue('blue.200', 'blue.800')}
          >
            <Heading size="md">{shoot.name}</Heading>
            <Heading size="xs">
              {shoot.date_taken &&
                new Date(shoot.date_taken).toLocaleDateString()}
            </Heading>
          </Flex>
        </LinkOverlay>
      </LinkBox>
    );
  };

  return (
    <>
      <Select
        defaultValue={sortingOption}
        mb={4}
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
    </>
  );
};

OnLocation.layout = (page) => (
  <BaseLayout title="On Location">{page}</BaseLayout>
);

export default OnLocation;
