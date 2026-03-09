import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

import { Link } from '@inertiajs/react';
import {
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Flex,
  Group,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconDownload } from '@tabler/icons-react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import BaseLayout from './components/BaseLayout';

const AlbumBreadcrumbs = ({ albumName, breadcrumbs }) => (
  <Breadcrumbs separator={<IconChevronRight size={14} />}>
    {breadcrumbs?.map((breadcrumb) => (
      <Anchor
        key={breadcrumb.name}
        component={Link}
        href={`/${breadcrumb.url_alias}/`}
      >
        {breadcrumb.name}
      </Anchor>
    ))}
    <span>{albumName}</span>
  </Breadcrumbs>
);

const Album = ({ album, breadcrumbs }) => {
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [isDownloading, setIsDownloading] = useState(false);

  const albumDownload = () => {
    setIsDownloading(true);
    axios({
      url: `/album-download/${album.id}`,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      saveAs(response.data, `${album.url_alias}.zip`);
      setIsDownloading(false);
    });
  };

  const customRenderPhoto = (props) => {
    const { renderDefaultPhoto } = props;

    return (
      <Box
        style={{
          position: 'relative',
          transition: '0.3s transform',
        }}
        styles={{ root: { '&:hover': { transform: 'scale(1.025)' } } }}
      >
        {renderDefaultPhoto()}
      </Box>
    );
  };

  const photoDownload = (url, filename) => {
    axios
      .post('/photo-download', {
        url,
      })
      .then((response) => {
        saveAs(`data:image/jpg;base64,${response.data}`, filename);
      });
  };

  return (
    <BaseLayout title={album.name}>
      <AlbumBreadcrumbs albumName={album.name} breadcrumbs={breadcrumbs} />

      {album?.photos.length > 0 && (
        <>
          <Group mb="md" justify="space-between">
            <Title>Photos</Title>
            {album?.is_public ? (
              <Button
                color="teal"
                variant="outline"
                size="lg"
                leftSection={<IconDownload size={18} />}
                onClick={albumDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            ) : null}
          </Group>

          <Flex mb="md" gap="xs" wrap="wrap">
            {album?.cosplayers?.map((cos) => (
              <Badge
                key={cos.id}
                component="a"
                href={`https://instagram.com/${cos.instagram}`}
                target="_blank"
                color="pink"
                style={{ cursor: 'pointer' }}
              >
                {cos?.pivot?.character} - {cos.name}
              </Badge>
            ))}
          </Flex>

          <PhotoAlbum
            layout="masonry"
            photos={album?.photos?.map((photo) => photo?.html)}
            columns={(containerWidth) => {
              if (containerWidth <= 500) return 1;
              if (containerWidth < 600) return 2;
              if (containerWidth < 1200) return 2;
              if (containerWidth < 1450) return 3;
              if (containerWidth < 2800) return 4;
              return 5;
            }}
            renderPhoto={customRenderPhoto}
            onClick={({ index: current }) => setPhotoIndex(current)}
          />

          <Lightbox
            open={photoIndex >= 0}
            close={() => setPhotoIndex(-1)}
            index={photoIndex}
            slides={album?.photos?.map((photo) => photo?.html)}
            plugins={[Counter, Download, Zoom]}
            counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
            download={{
              download: ({ slide }) => {
                photoDownload(slide.download, `${slide.title}.jpg`);
              },
            }}
          />
        </>
      )}
    </BaseLayout>
  );
};

export default Album;
