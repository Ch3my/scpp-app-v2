import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { DateTime } from "luxon";
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Categoria } from '../models/Categoria';
import { useTheme } from '../app/ScppThemeContext';
import { AppTextInput } from './ui/AppTextInput';
import { AppCheckbox } from './ui/AppCheckbox';
import { AppButton } from './ui/AppButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GetAppStyles } from '../styles/styles';
import { useCategorias } from '../api/hooks';

interface FiltersModalProps {
    visible: boolean;
    onDismiss: () => void;
    onFilterUpdate: (filters: {
        searchPhrase: string | undefined;
        categoriaFilterId: number | null;
        fechaInicio: DateTime | null;
        fechaTermino: DateTime | null;
        searchPhraseIgnoreOtherFilters: boolean;
    }) => void;
    initialSearchPhrase?: string;
    initialCategoriaFilterName: string;
    initialFechaInicio?: DateTime | null;
    initialFechaTermino?: DateTime | null;
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
    const appStyles = GetAppStyles(theme);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['60%'], []);

    const { data: categorias = [] } = useCategorias();

    const listOfCategoria: Categoria[] = useMemo(() => [
        { id: -1, descripcion: "(Todos)" },
        ...categorias
    ], [categorias]);

    const [searchPhrase, setSearchPhrase] = useState<string | undefined>(initialSearchPhrase)
    const [fechaInicio, setFechaInicio] = useState<DateTime | null>(initialFechaInicio)
    const [fechaTermino, setFechaTermino] = useState<DateTime | null>(initialFechaTermino)
    const [showFechaInicioPicker, setShowFechaInicioPicker] = useState<boolean>(false)
    const [showFechaTerminoPicker, setShowFechaTerminoPicker] = useState<boolean>(false)
    const [categoriaFilterId, setCategoriaFilterId] = useState<number | null>(null)
    const [searchPhraseIgnoreOtherFilters, setSearchPhraseIgnoreOtherFilters] = useState(true);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.snapToIndex(0);
        } else {
            bottomSheetRef.current?.close();
        }
    }, [visible]);

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
            fechaTermino,
            searchPhraseIgnoreOtherFilters
        });
        onDismiss()
    };

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onDismiss();
        }
    }, [onDismiss]);

    const renderBackDrop = useCallback((props: any) => (
        <BottomSheetBackdrop
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            {...props}
        />
    ), []);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            backdropComponent={renderBackDrop}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onClose={onDismiss}
            onChange={handleSheetChanges}
            backgroundStyle={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.secondary, borderWidth: 1 }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.onSurface }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={[appStyles.headlineSmall, { marginBottom: 10 }]}>Filtros</Text>
                <View style={{ flexDirection: "row", marginBottom: 5, alignItems: "center" }}>
                    <AppTextInput
                        style={{ flex: 1 }}
                        label="Buscar"
                        mode="flat"
                        dense={true}
                        value={searchPhrase}
                        onChangeText={setSearchPhrase}
                    />
                    <MaterialCommunityIcons name="filter-off" size={28} color={theme.colors.onSurfaceVariant} />
                    <AppCheckbox
                        status={searchPhraseIgnoreOtherFilters ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setSearchPhraseIgnoreOtherFilters(!searchPhraseIgnoreOtherFilters);
                        }}
                    />
                </View>
                <AppTextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha Inicio"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={fechaInicio?.toFormat('yyyy-MM-dd')}
                    rightIcon="calendar"
                    onRightIconPress={() => { setShowFechaInicioPicker(true) }}
                />
                {(showFechaInicioPicker && fechaInicio) && (
                    <DateTimePicker value={fechaInicio.toJSDate()} mode="date"
                        display="default" onChange={onChangeFechaIniFilter}
                    />
                )}
                <AppTextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha Termino"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={fechaTermino?.toFormat('yyyy-MM-dd')}
                    rightIcon="calendar"
                    onRightIconPress={() => { setShowFechaTerminoPicker(true) }}
                />
                {(showFechaTerminoPicker && fechaTermino) && (
                    <DateTimePicker value={fechaTermino.toJSDate()} mode="date"
                        display="default" onChange={onChangeFechaTerminoFilter}
                    />
                )}
                <Text style={appStyles.bodyMedium}>Categoria</Text>
                <Picker
                    selectedValue={categoriaFilterId}
                    style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant, marginBottom: 5 }}
                    mode='dropdown'
                    onValueChange={(itemValue, itemIndex) =>
                        setCategoriaFilterId(itemValue)
                    }>
                    {listOfCategoria.map((categoria) => (
                        <Picker.Item
                            key={categoria.id ?? "default"}
                            label={categoria.descripcion}
                            value={categoria.id}
                        />
                    ))}
                </Picker>
                <AppButton onPress={handleFilterUpdate}>LISTO</AppButton>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
    },
});
