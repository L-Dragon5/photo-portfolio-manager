import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';
import { Helmet } from 'react-helmet';

import { Box, CssBaseline } from '@material-ui/core';
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core/styles';
import { teal, pink } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: teal,
    secondary: pink,
  },
});

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(2),
  },
  logo: {
    width: '60%',
    margin: '0 auto',
    '& > img': {
      width: '100%',
    },
  },
}));

const BaseLayout = ({ title, children }) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>{title} | L-Dragon Photography</title>
      </Helmet>
      <CssBaseline />
      <Box component="header" className={classes.header}>
        <InertiaLink href="/">
          <div className={classes.logo}>
            <img src="logo-white.webp" alt="logo" />
          </div>
        </InertiaLink>
      </Box>
      <Box component="main">{children}</Box>
    </ThemeProvider>
  );
};

export default BaseLayout;
