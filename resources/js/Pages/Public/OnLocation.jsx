import { Link } from '@inertiajs/react';
import { Box, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import PhotoAlbum from 'react-photo-album';

import BaseLayout from './components/BaseLayout';
import SortSelect from './components/SortSelect';

const OnLocation = ({ albums }) => {
  const [sortingOption, setSortingOption] = useState('date-desc');
  const [activeAlbums, setActiveAlbums] = useState(albums);

  useEffect(() => {
    if (sortingOption === 'date-desc') {
      setActiveAlbums(albums);
    } else if (sortingOption === 'date-asc') {
      setActiveAlbums(albums.toReversed());
    } else if (sortingOption === 'name-asc') {
      setActiveAlbums(
        albums.toSorted((a, b) =>
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
        ),
      );
    } else if (sortingOption === 'name-desc') {
      setActiveAlbums(
        albums.toSorted((a, b) =>
          b.name.localeCompare(a.name, 'en', { sensitivity: 'base' }),
        ),
      );
    }
  }, [sortingOption]);

  const customRenderPhoto = ({ layout, wrapperStyle, renderDefaultPhoto }) => {
    const shoot = activeAlbums[layout.index];

    return (
      <Box
        key={shoot.id}
        component={Link}
        href={`/on-location/${shoot?.url_alias ? shoot.url_alias : shoot.id}/`}
        style={{
          ...wrapperStyle,
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px solid var(--mantine-color-gray-3)',
          transition: '0.3s transform',
          display: 'block',
          textDecoration: 'none',
          position: 'relative',
        }}
        styles={{ root: { '&:hover': { transform: 'scale(1.025)' } } }}
      >
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            padding: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: '100%',
          }}
        >
          <Title order={4} c="gray.1">
            {shoot.name}
          </Title>
          <Title order={6} c="gray.1">
            {shoot.date_taken &&
              new Date(shoot.date_taken).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
          </Title>
        </Box>
        {renderDefaultPhoto({ wrapped: true })}
      </Box>
    );
  };

  return (
    <>
      <SortSelect value={sortingOption} onChange={(val) => setSortingOption(val ?? 'date-desc')} />

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
