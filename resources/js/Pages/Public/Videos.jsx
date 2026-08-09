import { Text, Title } from '@mantine/core';

import BaseLayout from './components/BaseLayout';
import VideoGrid from './components/VideoGrid';

const Videos = ({ videos }) => {
  return (
    <>
      <Title order={1} mb="md">
        Videos
      </Title>
      {videos.length === 0 ? (
        <Text c="dimmed">No videos yet. Check back soon.</Text>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </>
  );
};

Videos.layout = (page) => <BaseLayout title="Videos">{page}</BaseLayout>;

export default Videos;
