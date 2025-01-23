import {
    StyleSheet, Text, TouchableOpacity,
    View, ScrollView, FlatList
} from 'react-native';
import { Link, Stack } from "expo-router";
import { useEffect, useState, useRef, useContext } from 'react';
import { GetAppStyles } from "../../../styles/styles"
import {
    IconButton, useTheme, Button, TextInput,
    Portal, Dialog, List, Snackbar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../../ScppContext"
import MaskInput, { createNumberMask } from 'react-native-mask-input';
import { useLocalSearchParams } from 'expo-router';

export default () => {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix, setRefetchdocs } = useContext(ScppContext);

    const [showDocDatePicker, setShowDocDatePicker] = useState<boolean>(false);
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false);
    const [showCategoriaInput, setShowCategoriaInput] = useState<boolean>(true)
    const [showTipoDocList, setShowTipoDocList] = useState<boolean>(false);
    const [showSnackBar, setShowSnackBar] = useState<boolean>(false);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");
    const [negativeMonto, setNegativeMonto] = useState<boolean>(false)

    const [listOfCategoria, setListOfCategoria] = useState<Categoria[]>([])
    const [listOfTipoDoc, setListOfTipoDoc] = useState<TipoDoc[]>([])

    let [docDate, setDocDate] = useState<DateTime>(DateTime.local())
    let [docCatId, setDocCatId] = useState<number | null>(0)
    let [docId, setDocId] = useState<number>(0)
    let [docCatName, setDocCatName] = useState<string>("")
    let [docTipoDocId, setDocTipoDocId] = useState<number>(0)
    let [docTipoDocName, setDocTipoDocName] = useState<string>("")
    let [docProposito, setDocProposito] = useState<string>("")
    let [docMonto, setDocMonto] = useState<number>(0)

    useEffect(() => {
        const getOriginalDoc = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/documentos', {
                    params: {
                        sessionHash,
                        id: [id]
                    }
                });
                if (response.data) {
                    let doc = response.data[0]
                    setDocId(doc.id)
                    setDocDate(DateTime.fromFormat(doc.fecha, "yyyy-MM-dd"))
                    setDocMonto(doc.monto)
                    setDocProposito(doc.proposito)
                    setDocCatId(doc.fk_categoria)
                    setDocTipoDocId(doc.fk_tipoDoc)
                    setDocCatName(doc.categoria.descripcion)
                    setDocTipoDocName(doc.tipoDoc.descripcion)

                    if (doc.fk_tipoDoc != 1) {
                        setShowCategoriaInput(false)
                    }
                    if (doc.fk_tipoDoc == 1) {
                        setShowCategoriaInput(true)
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        const getCategorias = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/categorias', {
                    params: {
                        sessionHash
                    }
                });
                if (response.data) {
                    setListOfCategoria(response.data)
                }
            } catch (error) {
                console.log(error);
            }
        };
        const getTipoDoc = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/tipo-docs', {
                    params: {
                        sessionHash
                    }
                });
                if (response.data) {
                    setListOfTipoDoc(response.data)
                }
            } catch (error) {
                console.log(error);
            }
        };
        getOriginalDoc()
        getTipoDoc()
        getCategorias()
    }, [])

    const onChangeDocDatePicker = (selectedDate?: DateTime) => {
        setShowDocDatePicker(false)
        if (selectedDate) {
            setDocDate(selectedDate)
        }
    }
    const onUpdateCategoria = ({ id, descripcion }: { id: number | null, descripcion: string }) => {
        setDocCatId(id)
        setDocCatName(descripcion)
        setShowCategoriaList(false)
    }
    const onUpdateTipoDoc = ({ id, descripcion }: { id: number, descripcion: string }) => {
        setDocTipoDocId(id)
        setDocTipoDocName(descripcion)
        setShowTipoDocList(false)
        if (id != 1) {
            setShowCategoriaInput(false)
        }
        if (id == 1) {
            setShowCategoriaInput(true)
        }
    }
    const updateDoc = async () => {
        let computedMonto = docMonto
        if (negativeMonto) {
            computedMonto *= -1
        }
        let apiArgs = {
            id,
            sessionHash,
            fk_categoria: docCatId,
            proposito: docProposito,
            fecha: docDate.toFormat('yyyy-MM-dd'),
            monto: computedMonto,
            fk_tipoDoc: docTipoDocId
        }
        if (docTipoDocId != 1) {
            apiArgs.fk_categoria = null
        }
        let response = await axios.put(apiPrefix + '/documentos', apiArgs)
        if (response.data.hasErrors) {
            setSnackbarMsg("Error al editar documento")
            setShowSnackBar(true)
            return
        }
        setSnackbarMsg("Documento editado con Exito")
        setShowSnackBar(true)
        setRefetchdocs(true)
    }

    const dollarMask = createNumberMask({
        prefix: ['$', ' '],
        delimiter: '.',
        separator: ',',
        precision: 0,
    })

    return (
        <View style={{ flex: 1 }} >
            <Stack.Screen options={{ headerTitle: "Editar Documento" }} />
            <Portal>
                <Snackbar
                    duration={2500}
                    visible={showSnackBar}
                    style={{ zIndex: 999 }}
                    onDismiss={() => { setShowSnackBar(false) }}>
                    {snackbarMsg}
                </Snackbar>
            </Portal>
            <Portal>
                <Dialog visible={showCategoriaList} onDismiss={() => { setShowCategoriaList(false) }} style={{ height: '80%' }}>
                    <Dialog.Title>Categoria</Dialog.Title>
                    <Dialog.ScrollArea>
                        <FlatList
                            data={listOfCategoria}
                            renderItem={({ item }) =>
                                <List.Item
                                    title={item.descripcion}
                                    key={item.id}
                                    onPress={() => { onUpdateCategoria({ id: item.id, descripcion: item.descripcion }) }} />
                            } />
                    </Dialog.ScrollArea>
                </Dialog>
                <Dialog visible={showTipoDocList} onDismiss={() => { setShowTipoDocList(false) }}>
                    <Dialog.Title>Tipo Documento</Dialog.Title>
                    <Dialog.ScrollArea>
                        <FlatList
                            data={listOfTipoDoc}
                            renderItem={({ item }) =>
                                <List.Item
                                    title={item.descripcion}
                                    key={item.id}
                                    onPress={() => { onUpdateTipoDoc({ id: item.id, descripcion: item.descripcion }) }} />
                            } />
                    </Dialog.ScrollArea>
                </Dialog>
            </Portal>
            <View style={appStyles.btnRow}>
                <IconButton
                    style={appStyles.btnRowBtn}
                    icon="content-save"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    size={30}
                    onPress={updateDoc}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <TextInput mode="flat" label='Monto'
                    inputMode='numeric'
                    style={{ marginBottom: 5 }}
                    dense={true}
                    value={docMonto.toString()}
                    right={<TextInput.Icon icon="minus-circle" onPress={() => { setNegativeMonto(!negativeMonto) }}
                        color={() => negativeMonto ? "red" : theme.colors.onSurfaceVariant} />}
                    render={props =>
                        <MaskInput
                            {...props}
                            onChangeText={(masked, unmasked) => {
                                setDocMonto(parseInt(unmasked))
                            }}
                            mask={dollarMask}
                        />
                    } />

                <TextInput label='Proposito'
                    style={{ marginBottom: 5 }}
                    mode="flat"
                    dense={true}
                    value={docProposito}
                    autoCapitalize="none"
                    onChangeText={text => setDocProposito(text)} />
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={docDate.toFormat('yyyy-MM-dd')}
                    right={<TextInput.Icon icon="calendar" onPress={() => { setShowDocDatePicker(true) }} />}
                />
                {showDocDatePicker && (
                    <DateTimePicker testID="dateTimePicker" value={docDate.toJSDate()} mode="date"
                        display="default" onChange={(evt, date) => {
                            if (date) {
                                onChangeDocDatePicker(DateTime.fromJSDate(date))
                            }
                        }}
                    />
                )}
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Tipo Doc"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={docTipoDocName}
                    right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowTipoDocList(true) }} />}
                />
                {showCategoriaInput &&
                    <TextInput
                        style={{ marginBottom: 5 }}
                        label="Categoria"
                        mode="flat"
                        dense={true}
                        editable={false}
                        value={docCatName}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowCategoriaList(true) }} />}
                    />
                }

            </ScrollView>
        </View>
    )
}