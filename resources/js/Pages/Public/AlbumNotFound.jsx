import { Heading } from '@chakra-ui/react';

import BaseLayout from './components/BaseLayout';

const AlbumNotFound = () => {
  return (
    <BaseLayout title="404 Album Not Found">
      <Heading>Album Not Found</Heading>
    </BaseLayout>
  );
};

export default AlbumNotFound;
