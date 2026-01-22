import {
    StyleSheet, View, ScrollView, FlatList, Text, TouchableOpacity
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useState, useContext, useCallback } from 'react';
import { GetAppStyles } from "../../styles/styles"
import { useTheme } from '../ScppThemeContext';
import { AppIconButton } from '../../components/ui/AppIconButton';
import { AppButton } from '../../components/ui/AppButton';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { AppDialog } from '../../components/ui/AppDialog';
import { AppSnackbar } from '../../components/ui/AppSnackbar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from "luxon";
import axios from 'axios'
import { ScppContext } from "../ScppContext"
import MaskInput, { createNumberMask } from 'react-native-mask-input';
import { TextInput as RNTextInput } from 'react-native';

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix, setRefetchdocs, tipoDocumentos, categorias } = useContext(ScppContext);

    const [showDocDatePicker, setShowDocDatePicker] = useState<boolean>(false)
    const [showCategoriaInput, setShowCategoriaInput] = useState<boolean>(true)
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false)
    const [showTipoDocList, setShowTipoDocList] = useState<boolean>(false)
    const [apiCalling, setApiCalling] = useState<boolean>(false)

    const [showSnackBar, setShowSnackBar] = useState<boolean>(false)
    const [snackbarMsg, setSnackbarMsg] = useState<string>("")
    const [negativeMonto, setNegativeMonto] = useState<boolean>(false)

    let [docDate, setDocDate] = useState<Date>(new Date())
    let [docCatId, setDocCatId] = useState<number | null>(1)
    let [docCatName, setDocCatName] = useState<string>("")
    let [docTipoDocId, setDocTipoDocId] = useState<number>(1)
    let [docTipoDocName, setDocTipoDocName] = useState<string>("Gasto")
    let [docProposito, setDocProposito] = useState<string>("")
    let [docMonto, setDocMonto] = useState<number>(0)

    const onChangeDocDatePicker = useCallback((event: any, selectedDate?: Date) => {
        setShowDocDatePicker(false)
        if (selectedDate) {
            setDocDate(selectedDate)
        }
    }, [])
    const onUpdateCategoria = useCallback(({ id, descripcion }: { id: number | null, descripcion: string }) => {
        setDocCatId(id)
        setDocCatName(descripcion)
        setShowCategoriaList(false)
    }, [])
    const onUpdateTipoDoc = useCallback(({ id, descripcion }: { id: number, descripcion: string }) => {
        setDocTipoDocId(id)
        setDocTipoDocName(descripcion)
        setShowTipoDocList(false)
        if (id != 1) {
            setShowCategoriaInput(false)
        }
        if (id == 1) {
            setShowCategoriaInput(true)
        }
    }, [])
    const saveDoc = async () => {
        setApiCalling(true)
        setShowSnackBar(false)
        if (docTipoDocId == 1 && docCatId == 0) {
            setSnackbarMsg("Selecciona la categoria")
            setShowSnackBar(true)
            setApiCalling(false)
            return
        }
        if (docProposito == "") {
            setSnackbarMsg("Ingresa Proposito")
            setShowSnackBar(true)
            setApiCalling(false)
            return
        }
        if (docTipoDocId == 1 && docMonto == 0) {
            setSnackbarMsg("Ingresa el Monto")
            setShowSnackBar(true)
            setApiCalling(false)
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
        if (docTipoDocId == 1) {
            apiArgs.fk_categoria = docCatId
        }
        let response = await axios.post(apiPrefix + '/documentos', apiArgs)
        if (response.data.hasErrors) {
            setSnackbarMsg("Error al guardar documento")
            setShowSnackBar(true)
            setApiCalling(false)
            return
        }
        setSnackbarMsg("Documento guardado con Exito")
        setShowSnackBar(true)
        setRefetchdocs(true)
        setApiCalling(false)
    }

    const dollarMask = createNumberMask({
        prefix: ['$', ' '],
        delimiter: '.',
        separator: ',',
        precision: 0,
    })

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Agregar Documento" }} />
            <AppSnackbar
                duration={2500}
                visible={showSnackBar}
                onDismiss={() => { setShowSnackBar(false) }}>
                {snackbarMsg}
            </AppSnackbar>
            <AppDialog visible={showCategoriaList} onDismiss={() => { setShowCategoriaList(false) }}>
                <AppDialog.Title>Categoria</AppDialog.Title>
                <AppDialog.ListArea data={categorias}
                    renderItem={({ item }) =>
                        <TouchableOpacity
                            style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
                            key={item.id}
                            onPress={() => { onUpdateCategoria({ id: item.id, descripcion: item.descripcion }) }}>
                            <Text style={appStyles.textFontSize}>{item.descripcion}</Text>
                        </TouchableOpacity>
                    } />
            </AppDialog>
            <AppDialog visible={showTipoDocList} onDismiss={() => { setShowTipoDocList(false) }}>
                <AppDialog.Title>Tipo Documento</AppDialog.Title>
                <AppDialog.ScrollArea>
                    <FlatList
                        data={tipoDocumentos}
                        renderItem={({ item }) =>
                            <TouchableOpacity
                                style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
                                key={item.id}
                                onPress={() => { onUpdateTipoDoc({ id: item.id, descripcion: item.descripcion }) }}>
                                <Text style={appStyles.textFontSize}>{item.descripcion}</Text>
                            </TouchableOpacity>
                        } />
                </AppDialog.ScrollArea>
            </AppDialog>
            <View style={[appStyles.btnRow, appStyles.onlyBtnRow]}>
                <AppIconButton
                    icon="content-save"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    size={30}
                    onPress={saveDoc}
                    disabled={apiCalling}
                />
            </View>
            <View style={appStyles.container}>
                <ScrollView>
                    <View style={{ flexDirection: 'column', gap: 5 }}>
                        <View style={{
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: theme.colors.outline,
                            paddingHorizontal: 12,
                            paddingTop: 26,
                            paddingBottom: 8,
                        }}>
                            <Text style={{ position: 'absolute', top: 8, left: 12, fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                                Monto
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaskInput
                                    style={{ flex: 1, fontSize: 16, color: theme.colors.onSurface, paddingVertical: 0 }}
                                    value={docMonto.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(masked, unmasked) => {
                                        setDocMonto(parseInt(unmasked) || 0)
                                    }}
                                    mask={dollarMask}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                />
                                <TouchableOpacity
                                    onPress={() => { setNegativeMonto(!negativeMonto) }}
                                    style={{
                                        padding: 4,
                                        borderRadius: 4,
                                        backgroundColor: negativeMonto ? theme.colors.errorContainer : theme.colors.surfaceVariant,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="minus"
                                        size={24}
                                        color={negativeMonto ? theme.colors.error : theme.colors.onSurfaceVariant}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <AppTextInput
                            label='Proposito'
                            mode="flat"
                            value={docProposito}
                            autoCapitalize="none"
                            onChangeText={text => setDocProposito(text)}
                        />
                        <AppTextInput
                            label="Fecha"
                            mode="flat"
                            editable={false}
                            value={DateTime.fromJSDate(docDate).toFormat('yyyy-MM-dd')}
                            rightIcon="calendar"
                            onRightIconPress={() => { setShowDocDatePicker(true) }}
                        />
                        {showDocDatePicker && (
                            <DateTimePicker testID="dateTimePicker" value={docDate} mode="date"
                                display="default" onChange={onChangeDocDatePicker}
                            />
                        )}
                        <AppTextInput
                            label="Tipo Doc"
                            mode="flat"
                            editable={false}
                            value={docTipoDocName}
                            rightIcon="chevron-down"
                            onRightIconPress={() => { setShowTipoDocList(true) }}
                        />
                        {showCategoriaInput &&
                            <AppTextInput
                                label="Categoria"
                                mode="flat"
                                editable={false}
                                value={docCatName}
                                rightIcon="chevron-down"
                                onRightIconPress={() => { setShowCategoriaList(true) }}
                            />
                        }
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}
