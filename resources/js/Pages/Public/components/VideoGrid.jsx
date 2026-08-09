import {
  AspectRatio,
  Box,
  Card,
  Image,
  Modal,
  SimpleGrid,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { useState } from 'react';

/**
 * Videos are YouTube embeds, so they sit in their own grid rather than being
 * mixed into the photo masonry. Clicking one opens it in a modal player.
 */
const VideoGrid = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  if (!videos || videos.length === 0) {
    return null;
  }

  const openVideo = (video) => {
    setActiveVideo(video);
    open();
  };

  const handleClose = () => {
    close();
    setActiveVideo(null);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {videos.map((video) => (
          <Card
            key={video.id}
            padding="xs"
            radius="md"
            withBorder
            onClick={() => openVideo(video)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Section pos="relative">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fit="cover"
                />
              </AspectRatio>
              <ThemeIcon
                radius="xl"
                size={54}
                color="dark"
                opacity={0.75}
                pos="absolute"
                top="50%"
                left="50%"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <IconPlayerPlayFilled size={24} />
              </ThemeIcon>
            </Card.Section>
            <Text fw={500} mt="sm" lineClamp={2}>
              {video.title}
            </Text>
            {video.description ? (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {video.description}
              </Text>
            ) : null}
          </Card>
        ))}
      </SimpleGrid>

      <Modal
        opened={opened}
        onClose={handleClose}
        size="xl"
        padding="xs"
        title={activeVideo?.title}
      >
        {activeVideo ? (
          <Box>
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={`${activeVideo.embed_url}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
              />
            </AspectRatio>
            {activeVideo.description ? (
              <Text size="sm" c="dimmed" mt="sm">
                {activeVideo.description}
              </Text>
            ) : null}
          </Box>
        ) : null}
      </Modal>
    </>
  );
};

export default VideoGrid;
