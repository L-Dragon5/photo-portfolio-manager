import { RepeatIcon, SpinnerIcon } from '@chakra-ui/icons';
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

import ModifyCosplayerToAlbum from './ModifyCosplayerToAlbum';

const EditAlbum = ({ events, reloadPage, onClose, album, cosplayers }) => {
  const { data, setData, put, processing, errors } = useForm(
    `EditAlbum-${album.id}`,
    {
      name: album?.name ?? '',
      event_id: album?.event_id ?? '',
      notes: album?.notes ?? '',
      url_alias: album?.url_alias ?? '',
      date_taken: album?.date_taken ?? '',
      password: album?.password ?? '',
      is_press: album?.is_press ?? false,
      is_public: album?.is_public ?? false,
    },
  );

  const onSubmit = (e) => {
    e.preventDefault();

    put(`/admin/albums/${album.id}`, {
      onSuccess: () => {
        reloadPage();
        onClose();
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

      <ModifyCosplayerToAlbum
        reloadPage={reloadPage}
        album={album}
        cosplayers={cosplayers}
      />

      <HStack justifyContent="flex-end" my={4} w="full">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          colorScheme="green"
          leftIcon={<RepeatIcon />}
          isLoading={processing}
        >
          Update Album
        </Button>
      </HStack>
    </VStack>
  );
};

export default EditAlbum;
