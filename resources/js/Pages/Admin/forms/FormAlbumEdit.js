import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import { Box, Button, ButtonGroup, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
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
  thumbnails: {
    maxWidth: 600,
  },
  thumbnail: {
    position: 'relative',
    display: 'inline-flex',
  },
  thumbnailImage: {
    width: 150,
    padding: theme.spacing(1),
    userSelect: 'none',
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    left: 5,
    cursor: 'pointer',
  },
}));

const FormAlbumEdit = ({ closeDrawer, reloadPage, album }) => {
  const classes = useStyles();

  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);

  const handleEditSubmit = (e) => {
    e.preventDefault();

    setSubmitting(true);

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

  const handleDelete = (id) => {
    Inertia.post(
      `/admin/photo/destroy`,
      {
        id,
      },
      {
        onSuccess: (page) => {
          reloadPage();
          closeDrawer();
        },
      },
    );
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
        required
        fullWidth
        defaultValue={album.album_id}
        name="album_id"
        variant="outlined"
        label="Parent Album ID"
        className={classes.formField}
      />

      <UploadButton />

      <TextField
        required
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

      <Box className={classes.thumbnails}>
        {album.photos?.map((photo) => (
          <Box key={photo.id} className={classes.thumbnail}>
            <img
              key={photo.id}
              src={`storage/${photo.location}`}
              className={classes.thumbnailImage}
              alt="thumbnail"
              draggable={false}
            />
            <DeleteForeverIcon
              className={classes.deleteIcon}
              title="Delete image forever"
              onClick={() => handleDelete(photo.id)}
            />
          </Box>
        ))}
      </Box>

      <ButtonGroup aria-label="add form buttons">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={submitting}
        >
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
