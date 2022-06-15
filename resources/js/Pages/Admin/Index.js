import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import {
  Box,
  Drawer,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import AdminLayout from './AdminLayout';
import ButtonAdd from './buttons/ButtonAdd';
import ButtonEdit from './buttons/ButtonEdit';
import ButtonDelete from './buttons/ButtonDelete';
import FormAlbumAdd from './forms/FormAlbumAdd';
import FormAlbumEdit from './forms/FormAlbumEdit';
import FormAlbumDelete from './forms/FormAlbumDelete';

const useStyles = makeStyles((theme) => ({
  contentRoot: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  text: {
    color: theme.palette.common.white,
  },
}));

const Index = ({ albums, availableAlbums }) => {
  const classes = useStyles();

  const [drawerStatus, setDrawerStatus] = useState(false);
  const [drawerContent, setDrawerContent] = useState('');

  const handleClose = () => {
    setDrawerStatus(false);
    setDrawerContent('');
  };

  const handleReload = () => {
    Inertia.reload({
      only: ['albums'],
    });
  };

  const handleAdd = () => {
    setDrawerContent(
      <FormAlbumAdd
        closeDrawer={handleClose}
        reloadPage={handleReload}
        availableAlbums={availableAlbums}
      />,
    );
    setDrawerStatus(true);
  };

  const handleEdit = (album) => {
    setDrawerContent(
      <FormAlbumEdit
        closeDrawer={handleClose}
        reloadPage={handleReload}
        availableAlbums={availableAlbums}
        album={album}
      />,
    );
    setDrawerStatus(true);
  };

  const handleDelete = (albumId, albumName) => {
    setDrawerContent(
      <FormAlbumDelete
        closeDrawer={handleClose}
        reloadPage={handleReload}
        albumId={albumId}
        albumName={albumName}
      />,
    );
    setDrawerStatus(true);
  };

  const AlbumRowComponent = ({ treeAlbums, level = 0 }) => {
    return (
      <>
        {treeAlbums.map((album) => (
          <React.Fragment key={album.name}>
            <TableRow key={album.name}>
              <TableCell>{album.id}</TableCell>
              <TableCell>
                {'='.repeat(level)} {album.name}
              </TableCell>
              <TableCell>{album.parent}</TableCell>
              <TableCell>{album.url_alias}</TableCell>
              <TableCell align="right">
                <ButtonEdit onClick={() => handleEdit(album)} />
                <ButtonDelete
                  onClick={() => handleDelete(album.id, album.name)}
                />
              </TableCell>
            </TableRow>
            {album.child_albums && (
              <AlbumRowComponent
                treeAlbums={album.child_albums}
                level={level + 1}
              />
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <AdminLayout title="Albums">
      <Box className={classes.contentRoot}>
        <Box className={classes.title}>
          <Typography component="span" variant="h4" className={classes.text}>
            Albums
          </Typography>
        </Box>

        <Drawer anchor="right" open={drawerStatus}>
          <Box>{drawerContent}</Box>
        </Drawer>

        <ButtonAdd onClick={handleAdd}>Add Album</ButtonAdd>

        {albums?.length > 0 ? (
          <TableContainer component={Paper} style={{ maxHeight: '80vh' }}>
            <Table
              stickyHeader
              className={classes.table}
              aria-label="table of album"
            >
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>URL Alias</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AlbumRowComponent treeAlbums={albums} />
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1">No albums</Typography>
        )}
      </Box>
    </AdminLayout>
  );
};

export default Index;
