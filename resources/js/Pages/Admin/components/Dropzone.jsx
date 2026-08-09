import {
  ActionIcon,
  Box,
  Group,
  Progress,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import '@mantine/dropzone/styles.css';
import {
  IconAlertTriangle,
  IconCheck,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';

const mergeArrays = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a];
  b.forEach((bItem) =>
    c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem),
  );
  return c;
};

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const StatusIcon = ({ status }) => {
  if (status === 'done') {
    return (
      <ThemeIcon color="green" variant="light" size="sm">
        <IconCheck size={14} />
      </ThemeIcon>
    );
  }
  if (status === 'failed') {
    return (
      <ThemeIcon color="red" variant="light" size="sm">
        <IconAlertTriangle size={14} />
      </ThemeIcon>
    );
  }
  return null;
};

/**
 * Files are listed as compact rows rather than image previews. Rendering
 * full-resolution thumbnails is what made large batches choke the browser.
 */
const Dropzone = ({ files, onFilesChange, progress = {}, disabled }) => {
  const handleDrop = (acceptedFiles) => {
    onFilesChange(
      mergeArrays(files, acceptedFiles, (a, b) => a.name === b.name),
    );
  };

  const removeFile = (index) => {
    onFilesChange(files.toSpliced(index, 1));
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Box w="100%">
      <MantineDropzone
        onDrop={handleDrop}
        accept={['image/jpeg', 'image/png']}
        disabled={disabled}
        w="100%"
      >
        <Group
          justify="center"
          gap="xl"
          mih={80}
          style={{ pointerEvents: 'none' }}
        >
          <MantineDropzone.Accept>
            <IconUpload
              size={40}
              color="var(--mantine-color-blue-6)"
              stroke={1.5}
            />
          </MantineDropzone.Accept>
          <MantineDropzone.Reject>
            <IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} />
          </MantineDropzone.Reject>
          <MantineDropzone.Idle>
            <IconPhoto
              size={40}
              color="var(--mantine-color-dimmed)"
              stroke={1.5}
            />
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
        <>
          <Text size="sm" c="dimmed" mt="sm">
            {files.length} file{files.length === 1 ? '' : 's'} selected (
            {formatSize(totalSize)})
          </Text>
          <ScrollArea.Autosize mah={320} mt="xs">
            <Stack gap={4}>
              {files.map((file, index) => {
                const state = progress[file.name];

                return (
                  <Group key={file.name} gap="sm" wrap="nowrap">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs" wrap="nowrap">
                        <StatusIcon status={state?.status} />
                        <Text size="sm" truncate style={{ flex: 1 }}>
                          {file.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatSize(file.size)}
                        </Text>
                      </Group>
                      {state && state.status !== 'failed' && (
                        <Progress
                          value={state.percent ?? 0}
                          size="xs"
                          mt={2}
                          color={state.status === 'done' ? 'green' : 'blue'}
                        />
                      )}
                      {state?.status === 'failed' && (
                        <Text size="xs" c="red">
                          {state.error}
                        </Text>
                      )}
                    </Box>
                    <ActionIcon
                      aria-label={`Remove ${file.name}`}
                      color="red"
                      variant="subtle"
                      size="sm"
                      disabled={disabled}
                      onClick={() => removeFile(index)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </>
      )}
    </Box>
  );
};

export default Dropzone;
