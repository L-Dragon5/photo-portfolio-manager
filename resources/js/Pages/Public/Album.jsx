import 'react-lazy-load-image-component/src/effects/blur.css';
import 'yet-another-react-lightbox/styles.css';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Grid,
  Heading,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Lightbox from 'yet-another-react-lightbox';

import BaseLayout from './components/BaseLayout';

const Breadcrumbs = ({ albumName, breadcrumbs }) => (
  <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
    <BreadcrumbItem>
      <BreadcrumbLink as={Link} href="/">
        Home
      </BreadcrumbLink>
    </BreadcrumbItem>

    {breadcrumbs?.map((breadcrumb) => (
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} href={`/${breadcrumb.url_alias}/`}>
          {breadcrumb.name}
        </BreadcrumbLink>
      </BreadcrumbItem>
    ))}

    <BreadcrumbItem isCurrentPage>
      <BreadcrumbLink>{albumName}</BreadcrumbLink>
    </BreadcrumbItem>
  </Breadcrumb>
);

const Album = ({ album, breadcrumbs }) => {
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [isDownloading, setIsDownloading] = useState(false);

  const { pathname } = window.location;

  const albumDownload = () => {
    setIsDownloading(true);
    router
      .get({
        url: `/album-download/${album.id}`,
      })
      .then((response) => {
        const href = response.data;
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `${album.id}.zip`); // or any other extension
        document.body.appendChild(link);
        link.click();
        setIsDownloading(false);
      });
  };

  return (
    <BaseLayout title={album.name}>
      <Breadcrumbs albumName={album.name} breadcrumbs={breadcrumbs} />

      {album.albums.length > 0 ||
        (album.photos.length > 0 && (
          <>
            <Heading>Albums</Heading>
            <Grid
              gap={12}
              gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
              gridAutoFlow="dense"
            >
              {album.albums?.map((childAlbum) => (
                <LinkBox
                  key={childAlbum.id}
                  rounded="md"
                  position="relative"
                  p={4}
                  gridColumn={childAlbum.is_landscape ? 'span 2' : 'span 1'}
                  cursor="pointer"
                  overflow="hidden"
                >
                  <LinkOverlay as={Link} href={`${pathname}/${childAlbum.id}/`}>
                    <LazyLoadImage
                      alt={childAlbum.name}
                      effect="blur"
                      src={childAlbum.cover_image}
                      wrapperProps={{
                        style: {
                          height: '100%',
                        },
                      }}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      position="relative"
                    />
                    <Box
                      position="absolute"
                      bottom={1}
                      width="full"
                      color="white"
                    >
                      <Heading size="md" textAlign="center">
                        {childAlbum.name}
                      </Heading>
                      <Heading size="xs" textAlign="center">
                        {childAlbum.date_taken &&
                          new Date(childAlbum.date_taken).toLocaleDateString()}
                      </Heading>
                    </Box>
                  </LinkOverlay>
                </LinkBox>
              ))}
            </Grid>
          </>
        ))}

      {album.photos.length > 0 && (
        <>
          <Heading>
            Photos
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={albumDownload}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </Heading>

          <Grid
            gap={12}
            gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
            gridAutoFlow="dense"
          >
            {album?.photos?.map((photo, index) => (
              <Box
                key={photo.id}
                gridColumn={album.is_landscape ? 'span 2' : 'span 1'}
                cursor="pointer"
                overflow="hidden"
                onClick={() => setPhotoIndex(index)}
              >
                <LazyLoadImage
                  alt="cosplayer"
                  effect="blur"
                  src={photo.thumbnail}
                  placeholderSrc={photo.lazy_thumbnail}
                  wrapperProps={{
                    style: {
                      height: '100%',
                    },
                  }}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  position="relative"
                  cursor="pointer"
                />
              </Box>
            ))}
          </Grid>

          <Lightbox
            open={photoIndex >= 0}
            close={() => setPhotoIndex(-1)}
            index={photoIndex}
            slides={album.photos}
          />
        </>
      )}
    </BaseLayout>
  );
};

export default Album;
