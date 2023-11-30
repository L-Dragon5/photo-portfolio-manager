import { AddIcon } from '@chakra-ui/icons';
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

const AddEvent = ({ reloadPage, onClose }) => {
  const { data, setData, post, reset, processing, errors } = useForm(
    'AddEvent',
    {
      name: '',
      url_alias: '',
      start_date: '',
      end_date: '',
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/events`, {
      onSuccess: () => {
        reloadPage();
        onClose();
        reset();
      },
    });
  };

  return (
    <VStack as="form" onSubmit={onSubmit} spacing={3}>
      <FormControl id="name" isInvalid={!!errors?.name} isRequired>
        <FormLabel>Event Name</FormLabel>
        <Input
          type="text"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
        />
        <FormErrorMessage>{errors?.name}</FormErrorMessage>
      </FormControl>

      <HStack spacing={3} w="full">
        <FormControl id="start_date" isInvalid={!!errors?.start_date}>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="date"
            value={data.start_date}
            onChange={(e) => setData('start_date', e.target.value)}
            min="2013-01-01"
            max={new Date().toISOString().split('T')[0]}
          />
          <FormErrorMessage>{errors?.start_date}</FormErrorMessage>
        </FormControl>
        <FormControl id="end_date" isInvalid={!!errors?.end_date}>
          <FormLabel>End Date</FormLabel>
          <Input
            type="date"
            value={data.end_date}
            onChange={(e) => setData('end_date', e.target.value)}
            min="2013-01-01"
            max={new Date().toISOString().split('T')[0]}
          />
          <FormErrorMessage>{errors?.end_date}</FormErrorMessage>
        </FormControl>
      </HStack>

      <HStack justifyContent="flex-end" my={4} w="full">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          colorScheme="green"
          leftIcon={<AddIcon />}
          isLoading={processing}
        >
          Add New Event
        </Button>
      </HStack>
    </VStack>
  );
};

export default AddEvent;
