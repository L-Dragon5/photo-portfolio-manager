import { RepeatIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useForm } from '@inertiajs/react';

const EditCosplayer = ({ reloadPage, onClose, cosplayer }) => {
  const { data, setData, put, processing, errors } = useForm('EditCosplayer', {
    name: cosplayer?.name ?? '',
    instagram: cosplayer?.instagram ?? '',
    twitter: cosplayer?.twitter ?? '',
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(`/admin/cosplayers/${cosplayer.id}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
      },
    });
  };

  return (
    <VStack as="form" onSubmit={onSubmit} spacing={3}>
      <FormControl id="name" isInvalid={!!errors?.name} isRequired>
        <FormLabel>Cosplayer Name</FormLabel>
        <Input
          type="text"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
        />
        <FormErrorMessage>{errors?.name}</FormErrorMessage>
      </FormControl>
      <HStack spacing={3} w="full">
        <FormControl id="instagram" isInvalid={!!errors?.instagram}>
          <FormLabel>Instagram</FormLabel>
          <Input
            type="text"
            value={data.instagram}
            onChange={(e) => setData('instagram', e.target.value)}
          />
          <FormErrorMessage>{errors?.instagram}</FormErrorMessage>
        </FormControl>
        <FormControl id="twitter" isInvalid={!!errors?.twitter}>
          <FormLabel>Twitter</FormLabel>
          <Input
            type="text"
            value={data.twitter}
            onChange={(e) => setData('twitter', e.target.value)}
          />
          <FormErrorMessage>{errors?.twitter}</FormErrorMessage>
        </FormControl>
      </HStack>

      <HStack justifyContent="flex-end" my={4} w="full">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          colorScheme="green"
          leftIcon={<RepeatIcon />}
          isLoading={processing}
        >
          Update Cosplayer
        </Button>
      </HStack>
    </VStack>
  );
};

export default EditCosplayer;
