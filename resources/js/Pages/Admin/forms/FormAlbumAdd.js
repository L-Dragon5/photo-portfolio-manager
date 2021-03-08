import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import {
  Button,
  ButtonGroup,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.spacing(1),
  },
  formField: {
    marginBottom: theme.spacing(1),
  },
}));

const FormAlbumAdd = ({ closeDrawer, reloadPage, availableAlbums }) => {
  const classes = useStyles();

  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [parentAlbum, setParentAlbum] = useState(0);

  const handleAddSubmit = (e) => {
    e.preventDefault();

    setSubmitting(true);

    const formData = new FormData(e.target);
    formData.set('album_id', parentAlbum);
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    Inertia.post(`/admin/album/store`, formData, {
      onSuccess: (page) => {
        reloadPage();
        closeDrawer();
      },
    });
  };

  return (
    <form className={classes.form} onSubmit={handleAddSubmit}>
      <TextField
        required
        fullWidth
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
          {availableAlbums?.map((album) => (
            <MenuItem key={album.id} value={album.id}>
              {album.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={submitting}
        >
          Submit
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

export default FormAlbumAdd;
