import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const ModifyCosplayerToAlbum = ({ reloadPage, album }) => {
  const [cosplayers, setCosplayers] = useState([]);
  const [activeCosplayers, setActiveCosplayers] = useState(album?.cosplayers);
  const { data, setData, put, reset, processing } = useForm(
    `ModifyCosplayerToAlbum-${album.id}`,
    {
      cosplayer_id: '',
      character: '',
    },
  );

  useEffect(() => {
    axios({
      url: '/api/admin/cosplayers',
      method: 'GET',
      responseType: 'json',
    }).then((response) => {
      setCosplayers(response.data);
    });
  }, []);

  const handleAddCosplayer = () => {
    put(`/admin/albums/${album.id}/cosplayer/add`, {
      onSuccess: () => {
        setActiveCosplayers((prevState) => [
          ...prevState,
          {
            ...cosplayers.find((c) => c.id == data.cosplayer_id),
            pivot: { character: data.character },
          },
        ]);
        reloadPage();
        reset();
      },
    });
  };

  const handleRemoveCosplayer = (id) => {
    router.delete(`/admin/albums/${album.id}/cosplayer/${id}`, {
      onSuccess: () => {
        setActiveCosplayers((prevState) =>
          prevState.toSpliced(
            prevState.findIndex((c) => c.id === id),
            1,
          ),
        );
        reloadPage();
      },
    });
  };

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Cosplayer</Th>
          <Th>Character</Th>
          <Th>Options</Th>
        </Tr>
      </Thead>
      <Tbody>
        {activeCosplayers?.map((cos) => (
          <Tr key={cos.id}>
            <Td>{cos?.name}</Td>
            <Td>{cos?.pivot?.character}</Td>
            <Td>
              <IconButton
                icon={<DeleteIcon />}
                isLoading={processing}
                onClick={() => handleRemoveCosplayer(cos.id)}
              />
            </Td>
          </Tr>
        ))}
        {cosplayers?.length > 0 ? (
          <Tr>
            <Td>
              <Select
                defaultValue={data.cosplayer_id}
                onChange={(e) => setData('cosplayer_id', e.target.value)}
              >
                <option value="">Choose a Cosplayer</option>
                {cosplayers
                  ?.filter((x) => !activeCosplayers.find((c) => c.id === x.id))
                  ?.map((c) => (
                    <option key={`option-${c.id}`} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </Td>
            <Td>
              <Input
                type="text"
                value={data.character}
                onChange={(e) => setData('character', e.target.value)}
              />
            </Td>
            <Td>
              <IconButton
                icon={<AddIcon />}
                isLoading={processing}
                onClick={handleAddCosplayer}
              />
            </Td>
          </Tr>
        ) : null}
      </Tbody>
    </Table>
  );
};

export default ModifyCosplayerToAlbum;
