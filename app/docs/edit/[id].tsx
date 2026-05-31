import {
    Text, TouchableOpacity,
    View, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { GetAppStyles } from "../../../styles/styles"
import { useTheme } from '../../ScppThemeContext';
import { AppIconButton } from '../../../components/ui/AppIconButton';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppDialog } from '../../../components/ui/AppDialog';
import { toast } from 'sonner-native';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { DateTime } from "luxon";
import MaskInput, { createNumberMask } from 'react-native-mask-input';
import { useLocalSearchParams } from 'expo-router';
import { useDocumento, useUpdateDocumento, useCategorias, useTipoDocumentos } from '../../../api/hooks';

export default () => {
    const { id } = useLocalSearchParams();
    const docId = Number(id);
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    const { data: documento } = useDocumento(docId);
    const { data: categorias = [] } = useCategorias();
    const { data: tipoDocumentos = [] } = useTipoDocumentos();
    const updateDocumentoMutation = useUpdateDocumento();

    const [showDocDatePicker, setShowDocDatePicker] = useState<boolean>(false);
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false);
    const [showCategoriaInput, setShowCategoriaInput] = useState<boolean>(true)
    const [showTipoDocList, setShowTipoDocList] = useState<boolean>(false);
    const [negativeMonto, setNegativeMonto] = useState<boolean>(false)

    let [docDate, setDocDate] = useState<DateTime>(DateTime.local())
    let [docCatId, setDocCatId] = useState<number | null>(0)
    let [docCatName, setDocCatName] = useState<string>("")
    let [docTipoDocId, setDocTipoDocId] = useState<number>(0)
    let [docTipoDocName, setDocTipoDocName] = useState<string>("")
    let [docProposito, setDocProposito] = useState<string>("")
    let [docMonto, setDocMonto] = useState<number>(0)

    useEffect(() => {
        if (documento) {
            setDocDate(DateTime.fromFormat(documento.fecha, "yyyy-MM-dd"))
            setDocMonto(documento.monto)
            setDocProposito(documento.proposito)
            setDocCatId(documento.fk_categoria)
            setDocTipoDocId(documento.fk_tipoDoc)
            setDocCatName((documento as any).categoria?.descripcion ?? "")
            setDocTipoDocName((documento as any).tipoDoc?.descripcion ?? "")

            if (documento.fk_tipoDoc != 1) {
                setShowCategoriaInput(false)
            }
            if (documento.fk_tipoDoc == 1) {
                setShowCategoriaInput(true)
            }
        }
    }, [documento])

    const onChangeDocDatePicker = (selectedDate: DateTime) => {
        setShowDocDatePicker(false)
        setDocDate(selectedDate)
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

        updateDocumentoMutation.mutate({
            id: docId,
            fk_categoria: docTipoDocId != 1 ? null : docCatId,
            proposito: docProposito,
            fecha: docDate.toFormat('yyyy-MM-dd'),
            monto: computedMonto,
            fk_tipoDoc: docTipoDocId,
        }, {
            onSuccess: () => {
                toast.success("Documento editado con Exito")
            },
            onError: () => {
                toast.error("Error al editar documento")
            }
        });
    }

    const dollarMask = createNumberMask({
        prefix: ['$', ' '],
        delimiter: '.',
        separator: ',',
        precision: 0,
    })

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Editar Documento" }} />
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
            <View style={[appStyles.btnRow, appStyles.onlyBtnRow]}>
                <AppIconButton
                    icon="content-save"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    size={30}
                    onPress={updateDoc}
                    disabled={updateDocumentoMutation.isPending}
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
                            value={docDate.toFormat('yyyy-MM-dd')}
                            rightIcon="calendar"
                            onRightIconPress={() => { setShowDocDatePicker(true) }}
                        />
                        {showDocDatePicker && (
                            <DateTimePicker testID="dateTimePicker" value={docDate.toJSDate()} mode="date"
                                display="default"
                                onValueChange={(_event, date) => onChangeDocDatePicker(DateTime.fromJSDate(date, { zone: 'utc' }))}
                                onDismiss={() => setShowDocDatePicker(false)}
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
