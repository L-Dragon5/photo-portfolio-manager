import { router } from '@inertiajs/react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useState } from 'react';

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

const FormAlbumEdit = ({ closeDrawer, reloadPage, availableAlbums, album }) => {
  const classes = useStyles();

  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [parentAlbum, setParentAlbum] = useState(album.album_id);

  const handleEditSubmit = (e) => {
    e.preventDefault();

    setSubmitting(true);

    const formData = new FormData(e.target);
    formData.set('_id', album._id);
    formData.set('album_id', parentAlbum);
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    router.post(`/admin/album/update`, formData, {
      onSuccess: (page) => {
        reloadPage();
        closeDrawer();
      },
    });
  };

  const handleDelete = (_id) => {
    router.post(
      `/admin/photo/destroy`,
      {
        _id,
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

      <FormControl fullWidth variant="outlined" className={classes.formField}>
        <InputLabel id="select-album-label">Parent Album</InputLabel>
        <Select
          labelId="select-album-label"
          id="select-album"
          value={parentAlbum}
          onChange={(e) => setParentAlbum(e.target.value)}
          label="Parent Album"
        >
          <MenuItem value={0}>Root</MenuItem>
          {availableAlbums?.map((a) => {
            if (a._id !== album._id) {
              return (
                <MenuItem key={a._id} value={a._id}>
                  {a.name}
                </MenuItem>
              );
            }
          })}
        </Select>
      </FormControl>

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
        filesLimit={150}
        showAlerts={false}
        onChange={setPhotos}
      />

      <Box className={classes.thumbnails}>
        {album.photos?.map((photo) => (
          <Box key={photo._id} className={classes.thumbnail}>
            <img
              key={photo._id}
              src={photo.location}
              className={classes.thumbnailImage}
              alt="thumbnail"
              draggable={false}
            />
            <DeleteForeverIcon
              className={classes.deleteIcon}
              title="Delete image forever"
              onClick={() => handleDelete(photo._id)}
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
