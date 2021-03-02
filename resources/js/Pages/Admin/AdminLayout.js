import React from 'react';
import { Helmet } from 'react-helmet';

import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { teal, pink } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: teal,
    secondary: pink,
  },
});

const AdminLayout = ({ title, children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>{title} | Admin Panel </title>
      </Helmet>
      <CssBaseline />
      <main>{children}</main>
    </ThemeProvider>
  );
};

export default AdminLayout;
