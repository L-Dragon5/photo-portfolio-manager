import React, { useState } from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import { Box, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import BaseLayout from './BaseLayout';

const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gridAutoFlow: 'dense',
    padding: theme.spacing(1),
    animation: `$fadeIn 1s`,
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
    marginRight: theme.spacing(0.5),
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const Album = ({ album, title, breadcrumbs }) => {
  const classes = useStyles();

  const [toggler, setToggler] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const Breadcrumbs = () => (
    <Box className={classes.breadcrumbs}>
      <InertiaLink href="/" className={classes.breadcrumbLink}>
        Home
      </InertiaLink>
      {breadcrumbs.map((breadcrumb) => (
        <React.Fragment key={breadcrumb.name}>
          {' '}
          &gt;{' '}
          <InertiaLink
            href={`/${breadcrumb.url_alias}/`}
            className={classes.breadcrumbLink}
          >
            {breadcrumb.name}
          </InertiaLink>
        </React.Fragment>
      ))}{' '}
      &gt; {album.name}
    </Box>
  );

  if (album.albums.length || album.photos.length) {
    return (
      <BaseLayout title={title}>
        <Breadcrumbs />

        {album.albums.length > 0 && (
          <>
            <Typography variant="h2" className={classes.heading}>
              Albums
            </Typography>
            <Box className={classes.grid}>
              {album.albums?.map((childAlbum) => (
                <InertiaLink
                  key={childAlbum.id}
                  href={`${childAlbum.url_alias}/`}
                  className={
                    childAlbum.is_landscape
                      ? `${classes.gridBase} ${classes.imageLandscape}`
                      : `${classes.gridBase} ${classes.imagePortrait}`
                  }
                >
                  <img
                    src={`/storage/${childAlbum.cover_image}`}
                    alt={childAlbum.name}
                    className={classes.image}
                  />
                  <Typography variant="body1" className={classes.title}>
                    {childAlbum.name}
                  </Typography>
                </InertiaLink>
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
                href={`/album-download/${album.id}`}
              >
                Download
              </Button>
            </Typography>

            <Box className={classes.grid}>
              {album?.photos?.map((photo, index) => (
                <Box
                  key={photo.id}
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
                  <img
                    src={`/storage/${photo.location}`}
                    alt="cosplayer"
                    className={classes.image}
                  />
                </Box>
              ))}
            </Box>
            {toggler && (
              <Lightbox
                animationOnKeyInput
                mainSrc={`/storage/${album.photos[photoIndex]?.location}`}
                nextSrc={`/storage/${
                  album.photos[(photoIndex + 1) % album.photos.length]?.location
                }`}
                prevSrc={`/storage/${
                  album.photos[
                    (photoIndex + album.photos.length - 1) % album.photos.length
                  ]?.location
                }`}
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
              />
            )}
          </>
        )}
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={title}>
      <Breadcrumbs />

      <Typography variant="h2" align="center" className={classes.heading}>
        Nothing here
      </Typography>
    </BaseLayout>
  );
};

export default Album;
