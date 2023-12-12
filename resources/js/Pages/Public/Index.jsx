import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

import { useState } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import BaseLayout from './components/BaseLayout';

const Index = ({ featuredPhotos }) => {
  const [photoIndex, setPhotoIndex] = useState(-1);

  return (
    <BaseLayout title="Feature">
      {featuredPhotos.length > 0 && (
        <>
          <PhotoAlbum
            layout="masonry"
            photos={featuredPhotos?.map((photo) => photo?.html)}
            columns={(containerWidth) => {
              if (containerWidth <= 500) return 1;
              if (containerWidth < 600) return 2;
              if (containerWidth < 1200) return 2;
              if (containerWidth < 1450) return 3;
              if (containerWidth < 2800) return 4;
              return 5;
            }}
            onClick={({ index: current }) => setPhotoIndex(current)}
          />

          <Lightbox
            open={photoIndex >= 0}
            close={() => setPhotoIndex(-1)}
            index={photoIndex}
            slides={featuredPhotos?.map((photo) => photo?.html)}
            plugins={[Counter, Thumbnails, Zoom]}
            counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
          />
        </>
      )}
    </BaseLayout>
  );
};

export default Index;
