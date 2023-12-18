import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

import { ChevronRightIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  Spacer,
  Tag,
} from '@chakra-ui/react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import BaseLayout from './components/BaseLayout';

const Breadcrumbs = ({ albumName, breadcrumbs }) => (
  <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
    {breadcrumbs?.map((breadcrumb) => (
      <BreadcrumbItem key={breadcrumb.name}>
        <BreadcrumbLink as={Link} href={`/${breadcrumb.url_alias}/`}>
          {breadcrumb.name}
        </BreadcrumbLink>
      </BreadcrumbItem>
    ))}

    <BreadcrumbItem isCurrentPage>
      <BreadcrumbLink>{albumName}</BreadcrumbLink>
    </BreadcrumbItem>
  </Breadcrumb>
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

  const customRenderPhoto = ({ renderDefaultPhoto }) => {
    return (
      <Box
        position="relative"
        transition="0.3s transform"
        _hover={{ transform: 'scale(1.025)' }}
      >
        {renderDefaultPhoto()}
      </Box>
    );
  };

  return (
    <BaseLayout title={album.name}>
      <Breadcrumbs albumName={album.name} breadcrumbs={breadcrumbs} />

      {album?.photos.length > 0 && (
        <>
          <HStack mb={4}>
            <Heading>Photos</Heading>
            {album?.is_public ? (
              <>
                <Spacer />
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  leftIcon={<DownloadIcon />}
                  onClick={albumDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </>
            ) : null}
          </HStack>

          <Flex spacing={4} mb={6} zIndex={2}>
            {album?.cosplayers?.map((cos) => (
              <Tag
                key={cos.id}
                as={Link}
                p={2}
                colorScheme="pink"
                href={`https://instagram.com/${cos.instagram}`}
                isExternal
              >
                {cos?.pivot?.character} - {cos.name}
              </Tag>
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
          />
        </>
      )}
    </BaseLayout>
  );
};

export default Album;
