import { InfiniteScroll, Link, router } from '@inertiajs/react';
import { Anchor, Box, Breadcrumbs, Center, Loader, Title } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import PhotoAlbum from 'react-photo-album';

import BaseLayout from './components/BaseLayout';
import SortSelect from './components/SortSelect';

const SingleEvent = ({ event, albums, sort: initialSort }) => {
  const [sort, setSort] = useState(initialSort);

  const handleSortChange = (val) => {
    const newSort = val ?? 'name-asc';
    setSort(newSort);
    router.reload({
      data: { sort: newSort },
      reset: ['albums'],
      only: ['albums'],
    });
  };

  const customRenderPhoto = ({ layout, wrapperStyle, renderDefaultPhoto }) => {
    const shoot = albums.data[layout.index];

    return (
      <Box
        key={shoot.id}
        component={Link}
        href={`/events/${event?.url_alias ? event.url_alias : event.id}/${
          shoot?.url_alias ? shoot.url_alias : shoot.id
        }/`}
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
              new Date(shoot.date_taken + 'T00:00:00').toLocaleDateString('en-US', {
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
    <BaseLayout title={event.name}>
      <Breadcrumbs separator={<IconChevronRight size={14} />} mb="md">
        <Anchor component={Link} href="/events">
          Events
        </Anchor>
        <span>{event.name}</span>
      </Breadcrumbs>

      <SortSelect value={sort} onChange={handleSortChange} />

      <InfiniteScroll
        data="albums"
        onlyNext
        next={({ loading }) =>
          loading ? (
            <Center mt="md">
              <Loader size="sm" />
            </Center>
          ) : null
        }
      >
        <PhotoAlbum
          layout="masonry"
          photos={albums.data.map((album) => album?.cover_image?.html)}
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
      </InfiniteScroll>
    </BaseLayout>
  );
};

export default SingleEvent;
