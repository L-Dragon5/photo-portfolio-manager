import { router, useForm } from '@inertiajs/react';
import { ActionIcon, Select, Table, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
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

  const availableCosplayers = cosplayers
    ?.filter((x) => !activeCosplayers.find((c) => c.id === x.id))
    ?.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Cosplayer</Table.Th>
          <Table.Th>Character</Table.Th>
          <Table.Th>Options</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {activeCosplayers?.map((cos) => (
          <Table.Tr key={cos.id}>
            <Table.Td>{cos?.name}</Table.Td>
            <Table.Td>{cos?.pivot?.character}</Table.Td>
            <Table.Td>
              <ActionIcon
                type="button"
                loading={processing}
                onClick={() => handleRemoveCosplayer(cos.id)}
                color="red"
                variant="subtle"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ))}
        {cosplayers?.length > 0 ? (
          <Table.Tr>
            <Table.Td>
              <Select
                searchable
                value={data.cosplayer_id}
                onChange={(val) => setData('cosplayer_id', val ?? '')}
                data={[
                  { value: '', label: 'Choose a Cosplayer' },
                  ...availableCosplayers,
                ]}
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                value={data.character}
                onChange={(e) => setData('character', e.target.value)}
              />
            </Table.Td>
            <Table.Td>
              <ActionIcon type="button" loading={processing} onClick={handleAddCosplayer}>
                <IconPlus size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ) : null}
      </Table.Tbody>
    </Table>
  );
};

export default ModifyCosplayerToAlbum;
