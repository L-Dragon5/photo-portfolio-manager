import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import { Button, ButtonGroup, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.spacing(1),
  },
  formField: {
    marginBottom: theme.spacing(1),
  },
  uploadButton: {
    width: '100%',
    marginBottom: theme.spacing(4),
  },
}));

const FormAlbumEdit = ({ closeDrawer, reloadPage, album }) => {
  const classes = useStyles();

  const [photos, setPhotos] = useState(album.photos);

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    formData.set('id', album.id);
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    Inertia.post(`/admin/album/update`, formData, {
      onSuccess: (page) => {
        reloadPage();
        closeDrawer();
      },
    });
  };

  const UploadButton = () => (
    <div className={classes.uploadButton}>
      <label htmlFor="album-button-file">
        <input
          accept="image/*"
          name="cover_image"
          style={{ display: 'none' }}
          id="album-button-file"
          type="file"
        />
        <Button variant="contained" color="primary" component="span">
          Upload Image
        </Button>
      </label>
    </div>
  );

  return (
    <form className={classes.form} onSubmit={handleEditSubmit}>
      <TextField
        required
        fullWidth
        defaultValue={album.name}
        name="name"
        variant="outlined"
        label="Album Name"
        className={classes.formField}
      />

      <TextField
        fullWidth
        defaultValue={album.album_id}
        name="album_id"
        variant="outlined"
        label="Parent Album ID"
        className={classes.formField}
      />

      <UploadButton />

      <TextField
        fullWidth
        defaultValue={album.url_alias}
        name="url_alias"
        variant="outlined"
        label="URL Alias"
        className={classes.formField}
      />

      <DropzoneArea
        acceptedFiles={['image/*']}
        dropzoneText="Drag and drop an image here or click"
        filesLimit={100}
        onChange={setPhotos}
      />

      <ButtonGroup aria-label="add form buttons">
        <Button type="submit" variant="contained" color="primary">
          Update
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

export default FormAlbumEdit;
