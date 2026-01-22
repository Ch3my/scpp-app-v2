import {
    Text, TouchableOpacity,
    View, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from "expo-router";
import { useEffect, useState, useContext } from 'react';
import { GetAppStyles } from "../../../styles/styles"
import { useTheme } from '../../ScppThemeContext';
import { AppIconButton } from '../../../components/ui/AppIconButton';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppDialog } from '../../../components/ui/AppDialog';
import { AppSnackbar } from '../../../components/ui/AppSnackbar';
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
    const { sessionHash, apiPrefix, setRefetchdocs, tipoDocumentos, categorias } = useContext(ScppContext);

    const [showDocDatePicker, setShowDocDatePicker] = useState<boolean>(false);
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false);
    const [showCategoriaInput, setShowCategoriaInput] = useState<boolean>(true)
    const [showTipoDocList, setShowTipoDocList] = useState<boolean>(false);
    const [showSnackBar, setShowSnackBar] = useState<boolean>(false);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");
    const [negativeMonto, setNegativeMonto] = useState<boolean>(false)
    const [apiCalling, setApiCalling] = useState<boolean>(false)

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
        getOriginalDoc()
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
        setApiCalling(true)
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
            setApiCalling(false)
            return
        }
        setSnackbarMsg("Documento editado con Exito")
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
        <SafeAreaView style={{ flex: 1 }}  >
            <Stack.Screen options={{ headerTitle: "Editar Documento" }} />
            <AppSnackbar
                duration={2500}
                visible={showSnackBar}
                onDismiss={() => { setShowSnackBar(false) }}>
                {snackbarMsg}
            </AppSnackbar>
            <AppDialog visible={showCategoriaList} onDismiss={() => { setShowCategoriaList(false) }}>
                <AppDialog.Title>Categoria</AppDialog.Title>
                <AppDialog.ScrollArea>
                    {categorias.map((item: any) => (
                        <TouchableOpacity
                            style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
                            key={item.id}
                            onPress={() => { onUpdateCategoria({ id: item.id, descripcion: item.descripcion }) }}>
                            <Text style={appStyles.textFontSize}>{item.descripcion}</Text>
                        </TouchableOpacity>
                    ))}
                </AppDialog.ScrollArea>
            </AppDialog>
            <AppDialog visible={showTipoDocList} onDismiss={() => { setShowTipoDocList(false) }}>
                <AppDialog.Title>Tipo Documento</AppDialog.Title>
                <AppDialog.ListArea
                    data={tipoDocumentos}
                    renderItem={({ item }) =>
                        <TouchableOpacity
                            style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
                            key={item.id}
                            onPress={() => { onUpdateTipoDoc({ id: item.id, descripcion: item.descripcion }) }}>
                            <Text style={appStyles.textFontSize}>{item.descripcion}</Text>
                        </TouchableOpacity>
                    } />
            </AppDialog>
            <View style={[appStyles.btnRow, { paddingHorizontal: 7, paddingTop: 7 }]}>
                <AppIconButton
                    icon="content-save"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    size={30}
                    onPress={updateDoc}
                    disabled={apiCalling}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <View style={{
                    marginVertical: 4,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                    paddingHorizontal: 12,
                    paddingTop: 24,
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
                        <TouchableOpacity onPress={() => { setNegativeMonto(!negativeMonto) }} style={{ padding: 4 }}>
                            <Text style={{ color: negativeMonto ? theme.colors.error : theme.colors.onSurfaceVariant, fontSize: 20 }}>
                                {negativeMonto ? '−' : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <AppTextInput label='Proposito'
                    style={{ marginBottom: 5 }}
                    mode="flat"
                    value={docProposito}
                    autoCapitalize="none"
                    onChangeText={text => setDocProposito(text)} />
                <AppTextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={docDate.toFormat('yyyy-MM-dd')}
                    rightIcon="calendar"
                    onRightIconPress={() => { setShowDocDatePicker(true) }}
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
                <AppTextInput
                    style={{ marginBottom: 5 }}
                    label="Tipo Doc"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={docTipoDocName}
                    rightIcon="chevron-down"
                    onRightIconPress={() => { setShowTipoDocList(true) }}
                />
                {showCategoriaInput &&
                    <AppTextInput
                        style={{ marginBottom: 5 }}
                        label="Categoria"
                        mode="flat"
                        dense={true}
                        editable={false}
                        value={docCatName}
                        rightIcon="chevron-down"
                        onRightIconPress={() => { setShowCategoriaList(true) }}
                    />
                }

            </ScrollView>
        </SafeAreaView>
    )
}
