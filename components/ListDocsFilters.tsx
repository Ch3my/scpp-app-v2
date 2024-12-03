import { IconButton, useTheme, Text, TextInput, Button } from 'react-native-paper';
import { useEffect, useState, useContext, useCallback } from 'react';
import { DateTime } from "luxon";
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlatList, Modal, View } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import { ScppContext } from "../app/ScppContext"
import { Picker } from '@react-native-picker/picker';

interface FiltersModalProps {
    visible: boolean;
    onDismiss: () => void;
    onFilterUpdate: (filters: {
        searchPhrase: string | undefined;
        categoriaFilterId: number | null;
        fechaInicio: DateTime | null;
        fechaTermino: DateTime | null;
    }) => void;
    initialSearchPhrase: string | undefined;
    initialCategoriaFilterName: string;
    initialFechaInicio: DateTime | null;
    initialFechaTermino: DateTime | null;
}

export default ({
    visible,
    onDismiss,
    onFilterUpdate,
    initialSearchPhrase = undefined,
    initialFechaInicio = DateTime.local().startOf("month"),
    initialFechaTermino = DateTime.local().endOf("month")
}: FiltersModalProps) => {
    const theme = useTheme();
    const { sessionHash, apiPrefix } = useContext(ScppContext);

    const [searchPhrase, setSearchPhrase] = useState<string | undefined>(initialSearchPhrase)
    const [fechaInicio, setFechaInicio] = useState<DateTime | null>(initialFechaInicio)
    const [fechaTermino, setFechaTermino] = useState<DateTime | null>(initialFechaTermino)
    const [showFechaInicioPicker, setShowFechaInicioPicker] = useState<boolean>(false)
    const [showFechaTerminoPicker, setShowFechaTerminoPicker] = useState<boolean>(false)
    const [categoriaFilterId, setCategoriaFilterId] = useState<number | null>(null)
    const [listOfCategoria, setListOfCategoria] = useState<Categoria[]>([])

    useEffect(() => {
        const getCategorias = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/categorias', {
                    params: {
                        sessionHash
                    }
                });
                if (response.data) {
                    // Add the item to the top of the array
                    const modifiedData = [
                        { id: -1, descripcion: "(Todos)" },
                        ...response.data
                    ];
                    setListOfCategoria(modifiedData)
                }
            } catch (error) {
                console.log(error);
            }
        }

        getCategorias()
    }, [])

    const onChangeFechaIniFilter = useCallback((event: any, selectedDate?: Date) => {
        setShowFechaInicioPicker(false)
        if (selectedDate) {
            setFechaInicio(DateTime.fromJSDate(selectedDate))
        }
    },
        [setShowFechaInicioPicker, setFechaInicio]
    );

    const onChangeFechaTerminoFilter = useCallback((event: any, selectedDate?: Date) => {
        setShowFechaTerminoPicker(false)
        if (selectedDate) {
            setFechaTermino(DateTime.fromJSDate(selectedDate))
        }
    },
        [setShowFechaTerminoPicker, setFechaTermino]
    );

    const handleFilterUpdate = () => {
        onFilterUpdate({
            searchPhrase,
            categoriaFilterId,
            fechaInicio,
            fechaTermino
        });
        onDismiss()
    };

    return (
        <View>
            <Modal visible={visible} onRequestClose={onDismiss} transparent={true} animationType='slide'>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <View style={{
                        padding: 20,
                        backgroundColor: theme.colors.surface,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        elevation: 5,
                    }}>
                        <Text variant="headlineSmall">Filtros</Text>
                        <TextInput
                            style={{ marginBottom: 5 }}
                            label="Buscar"
                            mode="flat"
                            dense={true}
                            value={searchPhrase}
                            onChangeText={setSearchPhrase} />
                        <TextInput
                            style={{ marginBottom: 5 }}
                            label="Fecha Inicio"
                            mode="flat"
                            dense={true}
                            editable={false}
                            value={fechaInicio?.toFormat('yyyy-MM-dd')}
                            right={<TextInput.Icon icon="calendar" onPress={() => { setShowFechaInicioPicker(true) }} />}
                        />
                        {(showFechaInicioPicker && fechaInicio) && (
                            <DateTimePicker value={fechaInicio.toJSDate()} mode="date"
                                display="default" onChange={onChangeFechaIniFilter}
                            />
                        )}
                        <TextInput
                            style={{ marginBottom: 5 }}
                            label="Fecha Termino"
                            mode="flat"
                            dense={true}
                            editable={false}
                            value={fechaTermino?.toFormat('yyyy-MM-dd')}
                            right={<TextInput.Icon icon="calendar" onPress={() => {
                                setShowFechaTerminoPicker(true)
                            }} />}
                        />
                        {(showFechaTerminoPicker && fechaTermino) && (
                            <DateTimePicker value={fechaTermino.toJSDate()} mode="date"
                                display="default" onChange={onChangeFechaTerminoFilter}
                            />
                        )}
                        <Text variant="bodyMedium">Categoria</Text>
                        <Picker
                            selectedValue={categoriaFilterId}
                            style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant, marginBottom: 5 }}
                            mode='dropdown'
                            onValueChange={(itemValue, itemIndex) =>
                                setCategoriaFilterId(itemValue)
                            }>
                            {listOfCategoria.map((categoria) => (
                                <Picker.Item
                                    key={categoria.id ?? "default"} // Provide a unique key, fallback to 'default' if `id` is null
                                    label={categoria.descripcion}
                                    value={categoria.id}
                                />
                            ))}
                        </Picker>
                        <Button onPress={handleFilterUpdate}>LISTO</Button>
                    </View>
                </View>
            </Modal >
        </View>

    )
}