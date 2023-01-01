import { InertiaLink } from '@inertiajs/inertia-react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

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
    maxHeight: 200,
    transition: 'all .5s',
    [theme.breakpoints.up('sm')]: {
      maxHeight: 350,
    },
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
}));

const Index = ({ albums }) => {
  const classes = useStyles();

  return (
    <BaseLayout title="Home">
      <Box className={classes.grid}>
        {albums?.map((album) => (
          <InertiaLink
            key={album.id}
            href={`/${album.url_alias}/`}
            className={classes.gridBase}
          >
            <img
              src={album.cover_image}
              alt={album.name}
              className={classes.image}
            />
            <Typography variant="body1" className={classes.title}>
              {album.name}
            </Typography>
          </InertiaLink>
        ))}
      </Box>
    </BaseLayout>
  );
};

export default Index;
