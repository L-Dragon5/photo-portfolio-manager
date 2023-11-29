import {
  Heading,
  LinkBox,
  LinkOverlay,
  Select,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import BaseLayout from './components/BaseLayout';

const Press = ({ albums }) => {
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
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
        ),
      );
    } else if (sortingOption === 'date-desc') {
      setActiveAlbums(
        albums.toSorted(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
        ),
      );
    }
  }, [sortingOption]);

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
      <SimpleGrid
        minChildWidth="250px"
        spacingX="12px"
        spacingY="24px"
        w="full"
      >
        {activeAlbums?.map((shoot) => (
          <LinkBox
            key={shoot.id}
            rounded="md"
            position="relative"
            p={4}
            _hover={{ bg: useColorModeValue('blue.200', 'blue.800') }}
          >
            <LinkOverlay as={Link} href={`/on-location/${shoot.id}/`}>
              <Heading size="md" textAlign="center">
                {shoot.name}
              </Heading>
              <Heading size="xs" textAlign="center">
                {[
                  shoot.start_date &&
                    new Date(shoot.start_date).toLocaleDateString(),
                  shoot.end_date &&
                    new Date(shoot.end_date).toLocaleDateString(),
                ]
                  .filter((n) => n)
                  .join(' - ')}
              </Heading>
            </LinkOverlay>
          </LinkBox>
        ))}
      </SimpleGrid>
    </>
  );
};

Press.layout = (page) => <BaseLayout title="Press">{page}</BaseLayout>;

export default Press;
