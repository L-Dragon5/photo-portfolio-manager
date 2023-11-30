import { router } from '@inertiajs/react';
import { useState } from 'react';

const EditAlbum = ({ events, reloadPage, onClose }) => {
  const [photos, setPhotos] = useState([]);

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    router.post(`/admin/album/update`, formData, {
      onSuccess: () => {
        reloadPage();
        onClose();
      },
    });
  };

  const handleDelete = (id) => {
    router.delete(`/admin/photo/${id}`, {
      onSuccess: () => {
        reloadPage();
      },
    });
  };
};

export default EditAlbum;
