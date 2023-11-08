import { DeleteIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, Image, Input, Text } from '@chakra-ui/react';
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
        height="300px"
        width="auto"
      />
      <IconButton
        aria-label="Delete photo"
        icon={<DeleteIcon />}
        onClick={() => removePhoto(index)}
      />
    </Box>
  ));

  useEffect(() => {
    setPhotos(files);
  }, [files]);

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <Box w="full">
      <Box
        {...getRootProps()}
        border="1px dashed"
        borderColor="gray.500"
        w="full"
        py={16}
      >
        <Input {...getInputProps()} cursor="pointer" />
        <Text textAlign="center" userSelect="none">
          Upload photos here
        </Text>
      </Box>
      {thumbs.length > 0 && (
        <Flex
          flexWrap="wrap"
          border="1px solid"
          borderColor="black"
          mt={3}
          py={4}
          gap={2}
          justifyContent="space-evenly"
        >
          {thumbs}
        </Flex>
      )}
    </Box>
  );
};

export default Dropzone;
