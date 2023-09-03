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
import { MaskedTextInput } from "react-native-mask-text";
import { useLocalSearchParams } from 'expo-router';

export default () => {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix } = useContext(ScppContext);

    const [showDocDatePicker, setShowDocDatePicker] = useState<boolean>(false);
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false);
    const [showTipoDocList, setShowTipoDocList] = useState<boolean>(false);
    const [showSnackBar, setShowSnackBar] = useState<boolean>(false);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");

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
    }
    const updateDoc = async () => {
        let apiArgs = {
            id,
            sessionHash,
            fk_categoria: docCatId,
            proposito: docProposito,
            fecha: docDate.toFormat('yyyy-MM-dd'),
            monto: docMonto,
            fk_tipoDoc: docTipoDocId
        }
        let response = await axios.put(apiPrefix + '/documentos', apiArgs)
        if (response.data.hasErrors) {
            setSnackbarMsg("Error al editar documento")
            setShowSnackBar(true)
            return
        }
        setSnackbarMsg("Documento editado con Exito")
        setShowSnackBar(true)
    }

    return (
        <View style={{ flex: 1 }} >
            <Stack.Screen options={{ headerTitle: "Editar Documento" }} />
            <Snackbar
                duration={2500}
                visible={showSnackBar}
                style={{ zIndex: 999 }}
                onDismiss={() => { setShowSnackBar(false) }}>
                {snackbarMsg}
            </Snackbar>
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
                    onPress={updateDoc}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <TextInput mode="flat" label='Monto'
                    keyboardType={'decimal-pad'}
                    style={{ marginBottom: 5 }}
                    dense={true}
                    value={docMonto.toString()}
                    render={props =>
                        <MaskedTextInput
                            {...props}
                            type="currency"
                            options={{
                                prefix: '$',
                                groupSeparator: '.',
                                precision: 0
                            }}
                            onChangeText={(formatted, extracted) => {
                                setDocMonto(parseInt(extracted))
                            }}
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
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Categoria"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={docCatName}
                    right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowCategoriaList(true) }} />}
                />

            </ScrollView>
        </View>
    )
}