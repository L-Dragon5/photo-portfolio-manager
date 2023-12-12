import { AddIcon, SpinnerIcon } from '@chakra-ui/icons';
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useForm } from '@inertiajs/react';

const AddAlbum = ({ events, reloadPage, onClose }) => {
  const { data, setData, post, processing, reset, errors } = useForm(
    'AddAlbum',
    {
      name: '',
      event_id: '',
      notes: '',
      url_alias: '',
      date_taken: '',
      password: '',
      is_press: false,
      is_public: false,
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    post(`/admin/albums`, {
      onSuccess: () => {
        reloadPage();
        onClose();
        reset();
      },
    });
  };

  const generatePassword = () => {
    const newPass = (Math.random() + 1).toString(36).substring(5);
    setData('password', newPass);
  };

  return (
    <VStack as="form" onSubmit={onSubmit} spacing={3}>
      <HStack spacing={3} w="full">
        <FormControl id="name" isInvalid={!!errors?.name} isRequired>
          <FormLabel>Album Name</FormLabel>
          <Input
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
          />
          <FormErrorMessage>{errors?.name}</FormErrorMessage>
        </FormControl>
        <FormControl id="event_id" isInvalid={!!errors?.event_id}>
          <FormLabel>Event</FormLabel>
          <Select
            value={data.event_id}
            onChange={(e) => setData('event_id', e.target.value)}
          >
            <option value="">No Event</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{data?.event_id}</FormErrorMessage>
        </FormControl>
        <FormControl id="is_press" isInvalid={!!errors?.is_press}>
          <FormLabel>Is Press?</FormLabel>
          <Checkbox
            defaultChecked={data.is_press}
            onChange={(e) => setData('is_press', e.target.checked)}
          >
            {data.is_press ? 'Yes' : 'No'}
          </Checkbox>
        </FormControl>
        <FormControl id="is_public" isInvalid={!!errors?.is_public}>
          <FormLabel>Is Public?</FormLabel>
          <Checkbox
            defaultChecked={data.is_public}
            onChange={(e) => setData('is_public', e.target.checked)}
          >
            {data.is_public ? 'Yes' : 'No'}
          </Checkbox>
        </FormControl>
      </HStack>
      <HStack spacing={3} w="full">
        <FormControl id="date_taken" isInvalid={!!errors?.date_taken}>
          <FormLabel>Date Taken</FormLabel>
          <Input
            type="date"
            value={data.date_taken}
            onChange={(e) => setData('date_taken', e.target.value)}
            min="2013-01-01"
            max={new Date().toISOString().split('T')[0]}
          />
          <FormErrorMessage>{errors?.date_taken}</FormErrorMessage>
        </FormControl>
        <FormControl id="url_alias" isInvalid={!!errors?.url_alias}>
          <FormLabel>URL Alias</FormLabel>
          <Input
            type="text"
            value={data.url_alias}
            onChange={(e) => setData('url_alias', e.target.value)}
          />
          <FormErrorMessage>{errors?.url_alias}</FormErrorMessage>
          <FormHelperText>Leave blank to generate one</FormHelperText>
        </FormControl>
      </HStack>
      <FormControl id="password" isInvalid={!!errors?.password}>
        <FormLabel>Password</FormLabel>
        <HStack>
          <Input
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            autoComplete="new-password"
          />
          <IconButton icon={<SpinnerIcon />} onClick={generatePassword} />
        </HStack>
      </FormControl>
      <FormControl id="notes" isInvalid={!!errors?.notes} mb={4}>
        <FormLabel>Notes</FormLabel>
        <Textarea
          value={data.notes}
          onChange={(e) => setData('notes', e.target.value)}
        />
        <FormErrorMessage>{data?.notes}</FormErrorMessage>
      </FormControl>

      <HStack justifyContent="flex-end" my={4} w="full">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          colorScheme="green"
          leftIcon={<AddIcon />}
          isLoading={processing}
        >
          Add New Album
        </Button>
      </HStack>
    </VStack>
  );
};

export default AddAlbum;
