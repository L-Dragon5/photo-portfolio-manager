import { ActionIcon, Box, Flex, Image, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const mergeArrays = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) =>
    c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem),
  );
  return c;
};

const Dropzone = ({ setPhotos }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevState) => {
      return mergeArrays(
        prevState,
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) }),
        ),
        (a, b) => a.name === b.name,
      );
    });
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    onDrop,
  });

  const removePhoto = (index) => {
    setFiles((prevState) => prevState.toSpliced(index, 1));
  };

  const thumbs = files?.map((file, index) => (
    <Box key={file.name} display="inline-flex">
      <Image
        src={file.preview}
        onLoad={() => URL.revokeObjectURL(file.preview)}
        h={300}
        w="auto"
      />
      <ActionIcon aria-label="Delete photo" onClick={() => removePhoto(index)}>
        <IconTrash size={16} />
      </ActionIcon>
    </Box>
  ));

  useEffect(() => {
    setPhotos(files);
  }, [files]);

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <Box w="100%">
      <Box
        {...getRootProps()}
        style={{
          border: '1px dashed var(--mantine-color-gray-5)',
          cursor: 'pointer',
        }}
        w="100%"
        py={64}
      >
        <input {...getInputProps()} />
        <Text ta="center" style={{ userSelect: 'none' }}>
          Upload photos here
        </Text>
      </Box>
      {thumbs.length > 0 && (
        <Flex
          wrap="wrap"
          style={{ border: '1px solid black' }}
          mt="sm"
          py="md"
          gap="sm"
          justify="space-evenly"
        >
          {thumbs}
        </Flex>
      )}
    </Box>
  );
};

export default Dropzone;
