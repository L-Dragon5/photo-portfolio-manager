import { Heading, SimpleGrid } from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import React from 'react';

import BaseLayout from './BaseLayout';

const Index = () => {
  const albums = [
    {
      id: 1,
      url_alias: 'test',
      name: 'Test Event',
      cover_image:
        'https://photo-portfolio-production-photoportfolioimages-zo958yhaaa6q.s3.amazonaws.com/placeholder.webp',
    },
  ];

  return (
    <BaseLayout title="Home">
      <SimpleGrid minChildWidth="350px" spacing="12px">
        {albums?.map((album) => (
          <Link key={album.id} href={`/${album.url_alias}/`}>
            <img src={album.cover_image} alt={album.name} />
            <Heading size="sm">{album.name}</Heading>
          </Link>
        ))}
      </SimpleGrid>
    </BaseLayout>
  );
};

export default Index;
