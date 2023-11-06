import { CssBaseline } from '@material-ui/core';
import { pink, teal } from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { Helmet } from 'react-helmet';

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
