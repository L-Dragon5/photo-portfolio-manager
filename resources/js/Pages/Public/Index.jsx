import {
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import React from 'react';

import BaseLayout from './components/BaseLayout';

const Index = ({ featuredPhotos }) => {
  return (
    <SimpleGrid minChildWidth="350px" spacing="12px" w="full">
      {featuredPhotos?.map((album) => (
        <LinkBox key={album.id} rounded="md" position="relative">
          <Image src={album.cover_image} alt={album.name} rounded="md" />
          <LinkOverlay as={Link} href={`/${album.url_alias}/`}>
            <Heading
              size="sm"
              position="absolute"
              bottom="0"
              textAlign="center"
            >
              {album.name}
            </Heading>
          </LinkOverlay>
        </LinkBox>
      ))}
    </SimpleGrid>
  );
};

Index.layout = (page) => <BaseLayout title="Featured">{page}</BaseLayout>;

export default Index;
