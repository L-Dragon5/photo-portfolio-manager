import { router } from '@inertiajs/react';
import { Button, ButtonGroup, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.spacing(1),
  },
  formField: {
    marginBottom: theme.spacing(1),
  },
}));

const FormAlbumDelete = ({ closeDrawer, reloadPage, albumId, albumName }) => {
  const classes = useStyles();

  const handleDeleteSubmit = (e) => {
    e.preventDefault();

    router.post(
      `/admin/album/destroy`,
      {
        _id: albumId,
      },
      {
        onSuccess: (page) => {
          reloadPage();
          closeDrawer();
        },
      },
    );
  };

  return (
    <form className={classes.form} onSubmit={handleDeleteSubmit}>
      <Typography>
        Are you sure you want to delete the album &quot;{albumName}&quot;?
      </Typography>
      <Typography>This is not reversible.</Typography>

      <ButtonGroup aria-label="add form buttons">
        <Button type="submit" variant="contained" color="primary">
          Delete
        </Button>
        <Button
          type="reset"
          variant="contained"
          color="secondary"
          onClick={closeDrawer}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  );
};

export default FormAlbumDelete;
