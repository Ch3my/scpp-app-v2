import { View, Modal, FlatList, Pressable, TouchableOpacity } from "react-native"
import { Link, Stack, router } from "expo-router";
import { IconButton, useTheme, Text, TextInput, Portal, List, Button } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useContext, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import { DateTime } from "luxon";
import numeral from "numeral"
import "numeral/locales/es-es";

import Reanimated, { Extrapolation, interpolate, LinearTransition, useAnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import ListDocsFilters from "../../components/ListDocsFilters";
import DocRow from "../../components/DocRow";
import DocHeader from "../../components/DocHeader";

export default () => {
    numeral.locale("es-es")

    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix, refetchDocs, setRefetchdocs, tipoDocumentos } = useContext(ScppContext);
    const [docsList, setDocsList] = useState<Documento[]>([])

    const [fechaInicio, setFechaInicio] = useState<DateTime | null>(DateTime.local().startOf("month"))
    const [fechaTermino, setFechaTermino] = useState<DateTime | null>(DateTime.local().endOf("month"))
    const [sumaTotalDocs, setSumaTotalDocs] = useState<number>(0)

    const [getDocsApiCalling, setGetDocsApiCalling] = useState<boolean>(true)

    const [tipoDocFilterId, setTipoDocFilterId] = useState<number>(1)
    const [categoriaFilterId, setCategoriaFilterId] = useState<number | null>(null)
    const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false)

    const [tipoDocFilterName, setTipoDocFilterName] = useState<string>("Gastos")
    const [categoriaFilterName, setCategoriaFilterName] = useState<string>("(Todos)")
    const [searchPhrase, setSearchPhrase] = useState<string | undefined>(undefined)

    const [showTipoDocFilter, setShowTipoDocFilter] = useState<boolean>(false)
    const [layoutReady, setLayoutReady] = useState(false);
    const [searchPhraseIgnoreOtherFilters, setSearchPhraseIgnoreOtherFilters] = useState(true);

    const getData = useCallback(async (aFechaInicio: DateTime | null,
        aFechaTermino: DateTime | null,
        afk_tipoDoc: number | null,
        afk_categoria: number | null,
        aSearchPhrase: string | undefined,
        aSearchPhraseIgnoreOtherFilters: boolean) => {
        // Si vienen argumentos usamos argumentos, sino usamos el estado
        // como se hace queue de los setState el argumento (si existe) esta mas actualizado el que State
        setGetDocsApiCalling(true)

        let localFechaInicio = fechaInicio
        if (aFechaInicio) {
            localFechaInicio = aFechaInicio
        }
        let localFechaTermino = fechaTermino
        if (aFechaTermino) {
            localFechaTermino = aFechaTermino
        }
        let localTipoDocId = tipoDocFilterId
        if (afk_tipoDoc) {
            localTipoDocId = afk_tipoDoc
        }
        // -1 something i created because picker coulnd not handle null aparently
        let localCategoriaId = categoriaFilterId
        if (afk_categoria) {
            localCategoriaId = afk_categoria
        }
        if (localCategoriaId == -1) {
            localCategoriaId = null
        }
        let localSearchPhraseIgnoreOtherFilters = searchPhraseIgnoreOtherFilters
        if (aSearchPhraseIgnoreOtherFilters) {
            localSearchPhraseIgnoreOtherFilters = aSearchPhraseIgnoreOtherFilters
        }
        try {
            const response: AxiosResponse<any> = await axios.get(apiPrefix + '/documentos', {
                params: {
                    fechaInicio: localFechaInicio?.toFormat('yyyy-MM-dd'),
                    fechaTermino: localFechaTermino?.toFormat('yyyy-MM-dd'),
                    fk_tipoDoc: localTipoDocId,
                    fk_categoria: localCategoriaId,
                    searchPhrase: aSearchPhrase,
                    searchPhraseIgnoreOtherFilters: aSearchPhraseIgnoreOtherFilters,
                    sessionHash
                },
            });
            if (response.data) {
                setDocsList(response.data)
                const suma = response.data.reduce((acc: number, doc: Documento) => acc + doc.monto, 0);
                setSumaTotalDocs(suma);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
            } else {
                console.error("Error fetching data:", error);
            }
        } finally {
            setGetDocsApiCalling(false)
        }
    }, [
        fechaInicio,
        fechaTermino,
        tipoDocFilterId,
        categoriaFilterId,
        searchPhrase,
        sessionHash,
        apiPrefix,
    ]);

    useEffect(() => {
        if (layoutReady) {
            getData(null, null, null, null, searchPhrase, false);
        }
    }, [layoutReady]);

    useEffect(() => {
        if (refetchDocs == true) {
            getData(null, null, null, null, searchPhrase, false)
            setRefetchdocs(false)
        }
    }, [refetchDocs])

    const setFechaToTipoDoc = (fk_tipoDoc: number | null) => {
        const currentDate = DateTime.local()
        let newFecIni = currentDate.startOf('year')
        let newFecTer = currentDate.endOf('year')
        if (fk_tipoDoc == 1) {
            newFecIni = currentDate.startOf('month')
            newFecTer = currentDate.endOf('month')
            // Gastos
            setFechaInicio(newFecIni)
            setFechaTermino(newFecTer)
            return [newFecIni, newFecTer]
        }
        setFechaInicio(newFecIni)
        setFechaTermino(newFecTer)
        return [newFecIni, newFecTer]
    }

    const onUpdateTipoDoc = async ({ id, descripcion }: { id: number, descripcion: string }) => {
        let [newFecIni, newFecTer] = setFechaToTipoDoc(id)
        setTipoDocFilterId(id)
        setTipoDocFilterName(descripcion)
        setShowTipoDocFilter(false)
        getData(newFecIni, newFecTer, id, null, searchPhrase, false)
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
        // NOTA este searchPhrase es el local de la funcion, no el estado
        getData(fechaInicio, fechaTermino, null, categoriaFilterId, searchPhrase, searchPhraseIgnoreOtherFilters)
    }

    const rightSwipe = useCallback((progress: any, dragX: any, id: number) => {
        const editStyle = useAnimatedStyle(() => {
            const translateX = interpolate(
                progress.value,
                [0, 1],
                [50, 1],
                Extrapolation.CLAMP
            );
            return {
                transform: [{ translateX }],
                backgroundColor: theme.colors.secondary,
                justifyContent: 'center',
                alignItems: 'center',
            };
        });

        const deleteStyle = useAnimatedStyle(() => {
            const translateX = interpolate(
                progress.value,
                [0, 1],
                [100, 1],
                Extrapolation.CLAMP
            );
            return {
                transform: [{ translateX }],
                backgroundColor: theme.colors.error,
                justifyContent: 'center',
                alignItems: 'center',
            };
        });

        const editAction = () => {
            router.push("/docs/edit/" + id)
        }
        const deleteDoc = async () => {
            setDocsList(prevDocs => prevDocs.filter(doc => doc.id !== id))
            // TODO. Update suma Total o lo hace getData luego
            try {
                await axios.delete(apiPrefix + '/documentos', { data: { id, sessionHash } })
                getData(null, null, null, null, searchPhrase, false)
            } catch (error) {
                console.log(error)
            }
        }

        return (
            <Reanimated.View style={{ flexDirection: 'row', width: 100 }}>
                <Reanimated.View style={deleteStyle}>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="delete"
                        iconColor={theme.colors.onError}
                        onPress={() => { deleteDoc() }}
                    />
                </Reanimated.View>
                <Reanimated.View style={editStyle}>
                    <IconButton
                        icon="file-edit"
                        iconColor={theme.colors.onSecondary}
                        onPress={() => { editAction() }}
                    />
                </Reanimated.View>
            </Reanimated.View>
        )
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: Documento }) => (
            <DocRow item={item} rightSwipe={rightSwipe} />
        ), []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }} onLayout={() => setLayoutReady(true)}>
            <Stack.Screen options={{ headerTitle: "Documentos" }} />
            <Portal>
                <ListDocsFilters visible={showFiltersModal}
                    initialFechaInicio={fechaInicio}
                    initialFechaTermino={fechaTermino}
                    initialCategoriaFilterName={categoriaFilterName}
                    initialSearchPhrase={searchPhrase}
                    onDismiss={() => {
                        setShowFiltersModal(false)
                    }}
                    onFilterUpdate={onFilterUpdate} />
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
            </Portal>
            <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: theme.colors.background }}>
                <View style={appStyles.btnRow}>
                    <Link href="/docs/add-doc" asChild>
                        <IconButton
                            style={appStyles.btnRowBtn}
                            size={30}
                            icon="plus"
                            mode="contained-tonal"
                            containerColor={theme.colors.primary}
                            iconColor={theme.colors.onPrimary}
                        />
                    </Link>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        size={30}
                        icon="filter"
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        onPress={() => { setShowFiltersModal(true) }}
                    />
                </View>
                <Text style={{ fontSize: 18 }}>$ {numeral(sumaTotalDocs).format('0,0')}</Text>
                <View style={appStyles.btnRow}>
                    <TextInput label='Tipo Doc'
                        style={{ width: 120 }}
                        mode="outlined"
                        editable={false}
                        dense={true}
                        value={tipoDocFilterName}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowTipoDocFilter(true) }} />}
                    />
                </View>
            </View>
            <Animated.FlatList
                data={docsList}
                onRefresh={() => { getData(null, null, null, null, searchPhrase, false) }}
                refreshing={getDocsApiCalling}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={<DocHeader />}
                keyExtractor={(item) => item.id.toString()}
                itemLayoutAnimation={LinearTransition}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay Datos</Text>}
                initialNumToRender={15}
            />
        </View>
    )
}