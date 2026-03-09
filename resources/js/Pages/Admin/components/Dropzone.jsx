import { ActionIcon, Box, Flex, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import '@mantine/dropzone/styles.css';
import { IconPhoto, IconTrash, IconUpload, IconX } from '@tabler/icons-react';

const mergeArrays = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a];
  b.forEach((bItem) =>
    c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem),
  );
  return c;
};

const Dropzone = ({ files, onFilesChange }) => {
  const handleDrop = (acceptedFiles) => {
    const withPreviews = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) }),
    );
    onFilesChange(mergeArrays(files, withPreviews, (a, b) => a.name === b.name));
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(files[index].preview);
    onFilesChange(files.toSpliced(index, 1));
  };

  return (
    <Box w="100%">
      <MantineDropzone
        onDrop={handleDrop}
        accept={['image/jpeg', 'image/png']}
        w="100%"
      >
        <Group justify="center" gap="xl" mih={80} style={{ pointerEvents: 'none' }}>
          <MantineDropzone.Accept>
            <IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </MantineDropzone.Accept>
          <MantineDropzone.Reject>
            <IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} />
          </MantineDropzone.Reject>
          <MantineDropzone.Idle>
            <IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </MantineDropzone.Idle>
          <Stack gap={4}>
            <Text size="lg" fw={500}>
              Drag images here or click to select
            </Text>
            <Text size="sm" c="dimmed">
              Accepts .jpg, .jpeg, .png
            </Text>
          </Stack>
        </Group>
      </MantineDropzone>

      {files.length > 0 && (
        <Flex wrap="wrap" mt="sm" py="md" gap="sm" justify="space-evenly">
          {files.map((file, index) => (
            <Box key={file.name} display="inline-flex">
              <Image
                src={file.preview}
                onLoad={() => {}}
                h={300}
                w="auto"
              />
              <ActionIcon
                aria-label="Remove photo"
                color="red"
                variant="subtle"
                onClick={() => removePhoto(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default Dropzone;
