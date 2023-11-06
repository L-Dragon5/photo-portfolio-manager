import { router } from '@inertiajs/react';
import {
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useState } from 'react';

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

    router.post(`/admin/album/store`, formData, {
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
            <MenuItem key={album._id} value={album._id}>
              {album.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <UploadButton />

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
        filesLimit={150}
        showAlerts={false}
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
