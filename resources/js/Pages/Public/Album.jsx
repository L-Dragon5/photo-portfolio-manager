import 'react-lazy-load-image-component/src/effects/blur.css';

import { ChevronRightIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Heading,
} from '@chakra-ui/react';
import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import BaseLayout from './BaseLayout';

/*
const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    animation: `$fadeIn 1s`,
    [theme.breakpoints.up('sm')]: {
      display: 'grid',
      gap: 12,
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gridAutoFlow: 'dense',
    },
  },
  gridBase: {
    position: 'relative',
    textAlign: 'center',
    cursor: 'pointer',
    filter: 'grayscale(100%)',
    overflow: 'hidden',
    transition: 'all .5s',
    '&:hover': {
      filter: 'grayscale(0%)',
    },
  },
  image: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'relative',
  },
  imagePortrait: {
    gridColumn: 'span 1',
  },
  imageLandscape: {
    gridColumn: 'span 2',
  },
  title: {
    position: 'absolute',
    bottom: theme.spacing(1),
    width: '100%',
    color: theme.palette.common.white,
    textShadow: `-1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000`,
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  heading: {
    color: theme.palette.common.white,
    margin: theme.spacing(3, 0, 1, 1),
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.common.white,
    margin: theme.spacing(0, 0, 0, 1),
    fontSize: theme.typography.pxToRem(18),
  },
  breadcrumbLink: {
    color: theme.palette.common.white,
    margin: theme.spacing(0, 0.5),
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  lazyWrapper: {
    height: '100%',
  },
}));
*/

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

const DownloadButton = ({ album, photoIndex }) => {
  const location = album.photos[photoIndex]?.location;
  const name = location.split('/').pop();

  const doClick = () => {
    router
      .get({
        url: `/photo-download/${album.photos[photoIndex]?._id}`,
        responseType: 'blob',
      })
      .then((response) => {
        const href = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', name); // or any other extension
        document.body.appendChild(link);
        link.click();
      });
  };

  return (
    <DownloadIcon
      onClick={doClick}
      style={{
        color: 'white',
        position: 'relative',
        top: 7,
        cursor: 'pointer',
      }}
    />
  );
};

const Album = ({ album, title, breadcrumbs }) => {
  const [toggler, setToggler] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const { pathname } = window.location;

  const albumDownload = () => {
    setIsDownloading(true);
    router
      .get({
        url: `/album-download/${album._id}`,
      })
      .then((response) => {
        const href = response.data;
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `${album._id}.zip`); // or any other extension
        document.body.appendChild(link);
        link.click();
        setIsDownloading(false);
      });
  };

  /*
  if (album.albums.length || album.photos.length) {
    return (
      <BaseLayout title={title}>
        <Breadcrumbs albumName={album.name} breadcrumbs={breadcrumbs} />

        {album.albums.length > 0 && (
          <>
            <Typography variant="h2" className={classes.heading}>
              Albums
            </Typography>
            <Box className={classes.grid}>
              {album.albums?.map((childAlbum) => (
                <Link
                  key={childAlbum._id}
                  href={`${pathname}/${childAlbum.url_alias}/`}
                  className={
                    childAlbum.is_landscape
                      ? `${classes.gridBase} ${classes.imageLandscape}`
                      : `${classes.gridBase} ${classes.imagePortrait}`
                  }
                >
                  <LazyLoadImage
                    alt={childAlbum.name}
                    effect="blur"
                    src={childAlbum.cover_image}
                    wrapperClassName={classes.lazyWrapper}
                    className={classes.image}
                  />
                  <Typography variant="body1" className={classes.title}>
                    {childAlbum.name}
                  </Typography>
                </Link>
              ))}
            </Box>
          </>
        )}

        {album.photos.length > 0 && (
          <>
            <Typography variant="h2" className={classes.heading}>
              Photos
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className={classes.button}
                onClick={albumDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            </Typography>

            <Box className={classes.grid}>
              {album?.photos?.map((photo, index) => (
                <Box
                  key={photo._id}
                  className={
                    photo.is_landscape
                      ? classes.imageLandscape
                      : classes.imagePortrait
                  }
                  onClick={() => {
                    setPhotoIndex(index);
                    setToggler(true);
                  }}
                >
                  <LazyLoadImage
                    alt="cosplayer"
                    effect="blur"
                    src={photo.thumbnail}
                    placeholderSrc={photo.lazy_thumbnail}
                    wrapperClassName={classes.lazyWrapper}
                    className={classes.image}
                  />
                </Box>
              ))}
            </Box>
            {toggler && (
              <Lightbox
                animationOnKeyInput
                mainSrc={album.photos[photoIndex]?.location}
                nextSrc={
                  album.photos[(photoIndex + 1) % album.photos.length]?.location
                }
                prevSrc={
                  album.photos[
                    (photoIndex + album.photos.length - 1) % album.photos.length
                  ]?.location
                }
                onCloseRequest={() => setToggler(false)}
                onMovePrevRequest={() =>
                  setPhotoIndex(
                    (photoIndex + album.photos.length - 1) %
                      album.photos.length,
                  )
                }
                onMoveNextRequest={() =>
                  setPhotoIndex((photoIndex + 1) % album.photos.length)
                }
                toolbarButtons={[
                  <DownloadButton album={album} photoIndex={photoIndex} />,
                ]}
              />
            )}
          </>
        )}
      </BaseLayout>
    );
  }
  */

  return (
    <BaseLayout title={title}>
      <Breadcrumbs albumName={album.name} breadcrumbs={breadcrumbs} />

      <Heading size="2xl" align="center">
        Nothing here
      </Heading>
    </BaseLayout>
  );
};

export default Album;
