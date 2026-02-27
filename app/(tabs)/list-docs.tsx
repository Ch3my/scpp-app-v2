import { View, Modal, FlatList, TouchableOpacity, Text } from "react-native"
import { Link, Stack, router } from "expo-router";
import { useTheme } from '../ScppThemeContext';
import { GetAppStyles } from "../../styles/styles"
import { useState, useCallback, useMemo } from 'react';
import { DateTime } from "luxon";
import numeral from "numeral"
import "numeral/locales/es-es";

import Reanimated, { Extrapolation, interpolate, LinearTransition, useAnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import ListDocsFilters from "../../components/ListDocsFilters";
import DocRow from "../../components/DocRow";
import DocHeader from "../../components/DocHeader";
import { Documento } from "../../models/Documento";
import { AppIconButton } from "../../components/ui/AppIconButton";
import { AppTextInput } from "../../components/ui/AppTextInput";
import { useDocumentos, useDeleteDocumento, useTipoDocumentos } from "../../api/hooks";
import { DocumentFilters } from "../../api/queryKeys";

export default () => {
    numeral.locale("es-es")

    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    const [fechaInicio, setFechaInicio] = useState<DateTime | null>(DateTime.local().startOf("month"))
    const [fechaTermino, setFechaTermino] = useState<DateTime | null>(DateTime.local().endOf("month"))

    const [tipoDocFilterId, setTipoDocFilterId] = useState<number>(1)
    const [categoriaFilterId, setCategoriaFilterId] = useState<number | null>(null)
    const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false)

    const [tipoDocFilterName, setTipoDocFilterName] = useState<string>("Gastos")
    const [categoriaFilterName, setCategoriaFilterName] = useState<string>("(Todos)")
    const [searchPhrase, setSearchPhrase] = useState<string | undefined>(undefined)

    const [showTipoDocFilter, setShowTipoDocFilter] = useState<boolean>(false)
    const [searchPhraseIgnoreOtherFilters, setSearchPhraseIgnoreOtherFilters] = useState(true);

    const { data: tipoDocumentos = [] } = useTipoDocumentos();

    const filters: DocumentFilters = useMemo(() => ({
        fechaInicio: fechaInicio?.toFormat('yyyy-MM-dd'),
        fechaTermino: fechaTermino?.toFormat('yyyy-MM-dd'),
        fk_tipoDoc: tipoDocFilterId,
        fk_categoria: categoriaFilterId,
        searchPhrase,
        searchPhraseIgnoreOtherFilters,
    }), [fechaInicio, fechaTermino, tipoDocFilterId, categoriaFilterId, searchPhrase, searchPhraseIgnoreOtherFilters]);

    const { data: docsList = [], isLoading, refetch } = useDocumentos(filters);
    const deleteDocumentoMutation = useDeleteDocumento(filters);

    const sumaTotalDocs = useMemo(() =>
        docsList.reduce((acc: number, doc: Documento) => acc + doc.monto, 0),
        [docsList]
    );

    const setFechaToTipoDoc = (fk_tipoDoc: number | null) => {
        const currentDate = DateTime.local()
        let newFecIni = currentDate.startOf('year')
        let newFecTer = currentDate.endOf('year')
        if (fk_tipoDoc == 1) {
            newFecIni = currentDate.startOf('month')
            newFecTer = currentDate.endOf('month')
            setFechaInicio(newFecIni)
            setFechaTermino(newFecTer)
            return [newFecIni, newFecTer]
        }
        setFechaInicio(newFecIni)
        setFechaTermino(newFecTer)
        return [newFecIni, newFecTer]
    }

    const onUpdateTipoDoc = async ({ id, descripcion }: { id: number, descripcion: string }) => {
        setFechaToTipoDoc(id)
        setTipoDocFilterId(id)
        setTipoDocFilterName(descripcion)
        setShowTipoDocFilter(false)
    }

    const onFilterUpdate = ({
        searchPhrase,
        categoriaFilterId,
        fechaInicio,
        fechaTermino,
        searchPhraseIgnoreOtherFilters
    }: {
        searchPhrase: string | undefined;
        categoriaFilterId: number | null;
        fechaInicio: DateTime | null;
        fechaTermino: DateTime | null;
        searchPhraseIgnoreOtherFilters: boolean;
    }) => {
        setSearchPhrase(searchPhrase)
        setFechaInicio(fechaInicio)
        setFechaTermino(fechaTermino)
        setCategoriaFilterId(categoriaFilterId)
        setSearchPhraseIgnoreOtherFilters(searchPhraseIgnoreOtherFilters)
    }

    const rightSwipe = useCallback((progress: any, dragX: any, id: number) => {
        const containerStyle = useAnimatedStyle(() => {
            const translateX = interpolate(
                progress.value,
                [0, 1],
                [100, 0],
                Extrapolation.CLAMP
            );
            return {
                transform: [{ translateX }],
                flexDirection: 'row',
                width: 100,
            };
        });

        const editAction = () => {
            router.push("/docs/edit/" + id)
        }
        const deleteDoc = async () => {
            deleteDocumentoMutation.mutate(id);
        }

        return (
            <Reanimated.View style={containerStyle}>
                <View style={{ flex: 1, backgroundColor: theme.colors.error, justifyContent: 'center', alignItems: 'center' }}>
                    <AppIconButton
                        icon="delete"
                        iconColor={theme.colors.onError}
                        onPress={() => { deleteDoc() }}
                    />
                </View>
                <View style={{ flex: 1, backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center' }}>
                    <AppIconButton
                        icon="file-edit"
                        iconColor={theme.colors.onSecondary}
                        onPress={() => { editAction() }}
                    />
                </View>
            </Reanimated.View>
        );
    }, [deleteDocumentoMutation, theme.colors]);

    const renderItem = useCallback(
        ({ item }: { item: Documento }) => (
            <DocRow item={item} rightSwipe={rightSwipe} />
        ), [rightSwipe]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Screen options={{ headerTitle: "Documentos" }} />
            <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: theme.colors.background, paddingHorizontal: 7 }}>
                <View style={appStyles.btnRow}>
                    <Link href="/docs/add-doc" asChild>
                        <AppIconButton
                            size={30}
                            icon="plus"
                            mode="contained-tonal"
                            containerColor={theme.colors.primary}
                            iconColor={theme.colors.onPrimary}
                            onPress={() => { }}
                        />
                    </Link>
                    <AppIconButton
                        size={30}
                        icon="filter"
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        onPress={() => { setShowFiltersModal(true) }}
                    />
                </View>
                <Text style={{ fontSize: 18, color: theme.colors.onBackground }}>$ {numeral(sumaTotalDocs).format('0,0')}</Text>
                <View style={appStyles.btnRow}>
                    <AppTextInput label='Tipo Doc'
                        style={{ width: 140 }}
                        mode="outlined"
                        editable={false}
                        dense={true}
                        value={tipoDocFilterName}
                        rightIcon="chevron-down"
                        onRightIconPress={() => { setShowTipoDocFilter(true) }}
                    />
                </View>
            </View>
            <Animated.FlatList
                data={docsList}
                onRefresh={() => { refetch() }}
                refreshing={isLoading}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={<DocHeader />}
                keyExtractor={(item) => item.id.toString()}
                itemLayoutAnimation={LinearTransition}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.onBackground }}>No hay Datos</Text>}
                initialNumToRender={15}
            />
            <Modal
                visible={showTipoDocFilter}
                onRequestClose={() => setShowTipoDocFilter(false)}
                transparent={true}
                animationType="fade"
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View
                        style={{
                            backgroundColor: theme.colors.background,
                            padding: 20,
                            borderRadius: 10,
                            width: '80%',
                            justifyContent: 'center',
                            borderColor: theme.colors.secondary,
                            borderWidth: 1,
                        }}>
                        <FlatList
                            data={tipoDocumentos}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ padding: 10, height: 50 }}
                                    key={item.id}
                                    onPress={() => onUpdateTipoDoc({ id: item.id, descripcion: item.descripcion })}
                                >
                                    <Text style={appStyles.textFontSize}>{item.descripcion}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
            <ListDocsFilters visible={showFiltersModal}
                initialFechaInicio={fechaInicio}
                initialFechaTermino={fechaTermino}
                initialCategoriaFilterName={categoriaFilterName}
                initialSearchPhrase={searchPhrase}
                onDismiss={() => {
                    setShowFiltersModal(false)
                }}
                onFilterUpdate={onFilterUpdate} />
        </View>
    )
}
