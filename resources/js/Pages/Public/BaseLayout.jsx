import { Link } from '@inertiajs/react';
import { Box, CssBaseline } from '@material-ui/core';
import { pink, teal } from '@material-ui/core/colors';
import {
  createTheme,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core/styles';
import React from 'react';
import { Helmet } from 'react-helmet';

const theme = createTheme({
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
        <Link href="/">
          <div className={classes.logo}>
            <img
              src="https://photo-portfolio-production-photoportfolioimages-zo958yhaaa6q.s3.amazonaws.com/logo-white.webp"
              alt="logo"
            />
          </div>
        </Link>
      </Box>
      <Box component="main">{children}</Box>
    </ThemeProvider>
  );
};

export default BaseLayout;
