
import {
    StyleSheet, View, ScrollView, FlatList
} from 'react-native';
import { Link, Stack } from "expo-router";
import { useEffect, useState, useRef, useContext } from 'react';
import { GetAppStyles } from "../../styles/styles"
import {
    IconButton, useTheme, Button, TextInput,
    Portal, Dialog, List, Snackbar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import { MaskedTextInput } from "react-native-mask-text";

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix } = useContext(ScppContext);

    const [showDocDatePicker, setShowDocDatePicker] = useState<boolean>(false)
    const [showCategoriaInput, setShowCategoriaInput] = useState<boolean>(true)
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false)
    const [showTipoDocList, setShowTipoDocList] = useState<boolean>(false)

    const [showSnackBar, setShowSnackBar] = useState<boolean>(false)
    const [snackbarMsg, setSnackbarMsg] = useState<string>("")
    const [negativeMonto, setNegativeMonto] = useState<boolean>(false)

    const [listOfCategoria, setListOfCategoria] = useState<Categoria[]>([])
    const [listOfTipoDoc, setListOfTipoDoc] = useState<TipoDoc[]>([])

    let [docDate, setDocDate] = useState<Date>(new Date())
    let [docCatId, setDocCatId] = useState<number | null>(1)
    let [docCatName, setDocCatName] = useState<string>("")
    let [docTipoDocId, setDocTipoDocId] = useState<number>(1)
    let [docTipoDocName, setDocTipoDocName] = useState<string>("Gasto")
    let [docProposito, setDocProposito] = useState<string>("")
    let [docMonto, setDocMonto] = useState<number>(0)

    useEffect(() => {
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
        getTipoDoc()
        getCategorias();
    }, [])

    const onChangeDocDatePicker = (event: any, selectedDate?: Date) => {
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
    const saveDoc = async () => {
        setShowSnackBar(false)
        if (docTipoDocId == 1 && docCatId == 0) {
            setSnackbarMsg("Selecciona la categoria")
            setShowSnackBar(true)
            return
        }
        if (docProposito == "") {
            setSnackbarMsg("Ingresa Proposito")
            setShowSnackBar(true)
            return
        }
        if (docTipoDocId == 1 && docMonto == 0) {
            setSnackbarMsg("Ingresa el Monto")
            setShowSnackBar(true)
            return
        }

        let computedMonto = docMonto
        if (negativeMonto) {
            computedMonto *= -1
        }

        let apiArgs: {
            fk_categoria: number | null;
            proposito: string;
            fecha: string;
            monto: number;
            fk_tipoDoc: number;
            sessionHash: string;
        } = {
            fk_categoria: null,
            proposito: docProposito,
            fecha: DateTime.fromJSDate(docDate).toFormat('yyyy-MM-dd'),
            monto: computedMonto,
            fk_tipoDoc: docTipoDocId,
            sessionHash,
        }
        if (docTipoDocId != 1) {
            apiArgs.fk_categoria = docCatId
        }
        let response = await axios.post(apiPrefix + '/documentos', apiArgs)
        if (response.data.hasErrors) {
            setSnackbarMsg("Error al guardar documento")
            setShowSnackBar(true)
            return
        }
        setSnackbarMsg("Documento guardado con Exito")
        setShowSnackBar(true)
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Agregar Documento" }} />
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
                    onPress={saveDoc}
                />
            </View>
            <View style={appStyles.container}>
                <ScrollView>
                    <TextInput mode="flat" label='Monto'
                        keyboardType={'decimal-pad'}
                        value={docMonto.toString()}
                        dense={true}
                        style={{ marginBottom: 5 }}
                        right={<TextInput.Icon icon="minus-circle" onPress={() => { setNegativeMonto(!negativeMonto) }}
                            color={() => negativeMonto ? "red" : theme.colors.onSurfaceVariant} />}
                        render={props =>
                            <MaskedTextInput
                                {...props}
                                type="currency"
                                options={{
                                    prefix: '$',
                                    groupSeparator: '.',
                                    precision: 0,
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
                        value={DateTime.fromJSDate(docDate).toFormat('yyyy-MM-dd')}
                        right={<TextInput.Icon icon="calendar" onPress={() => { setShowDocDatePicker(true) }} />}
                    />
                    {showDocDatePicker && (
                        <DateTimePicker testID="dateTimePicker" value={docDate} mode="date"
                            display="default" onChange={onChangeDocDatePicker}
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
        </View>
    )
}