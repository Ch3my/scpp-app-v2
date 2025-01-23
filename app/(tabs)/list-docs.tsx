import { View, InteractionManager, FlatList } from "react-native"
import { Link, useNavigation, Stack, router, useFocusEffect, useSegments } from "expo-router";
import { IconButton, useTheme, Text, TextInput, Portal, Dialog, List, Button } from 'react-native-paper';
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
    const { sessionHash, apiPrefix, refetchDocs, setRefetchdocs } = useContext(ScppContext);
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
    const [listOfTipoDoc, setListOfTipoDoc] = useState<TipoDoc[]>([])

    const getData = useCallback(async (aFechaInicio: DateTime | null,
        aFechaTermino: DateTime | null,
        afk_tipoDoc: number | null,
        afk_categoria: number | null,
        aSearchPhrase: string | undefined) => {
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

        try {
            const response: AxiosResponse<any> = await axios.get(apiPrefix + '/documentos', {
                params: {
                    fechaInicio: localFechaInicio?.toFormat('yyyy-MM-dd'),
                    fechaTermino: localFechaTermino?.toFormat('yyyy-MM-dd'),
                    fk_tipoDoc: localTipoDocId,
                    fk_categoria: localCategoriaId,
                    searchPhrase: aSearchPhrase,
                    sessionHash
                }
            });
            if (response.data) {
                setDocsList(response.data)
                let suma = 0
                for (let d of response.data) {
                    suma += d.monto
                }
                setSumaTotalDocs(suma)
            }
        } catch (error) {
            console.log(error);
        }
        setGetDocsApiCalling(false)
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
        getData(null, null, null, null, searchPhrase)
    }, [])

    useEffect(()=> {
        if(refetchDocs == true) {
            getData(null, null, null, null, searchPhrase)
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
        getData(newFecIni, newFecTer, id, null, searchPhrase)
    }

    const onFilterUpdate = ({
        searchPhrase,
        categoriaFilterId,
        fechaInicio,
        fechaTermino
    }: {
        searchPhrase: string | undefined;
        categoriaFilterId: number | null;
        fechaInicio: DateTime | null;
        fechaTermino: DateTime | null;
    }) => {
        setSearchPhrase(searchPhrase)
        setFechaInicio(fechaInicio)
        setFechaTermino(fechaTermino)
        setCategoriaFilterId(categoriaFilterId)
        // NOTA este searchPhrase es el local de la funcion, no el estado
        getData(fechaInicio, fechaTermino, null, categoriaFilterId, searchPhrase)
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
                getData(null, null, null, null, searchPhrase)
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
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Screen options={{ headerTitle: "Documentos" }} />
            <ListDocsFilters visible={showFiltersModal}
                initialFechaInicio={fechaInicio}
                initialFechaTermino={fechaTermino}
                initialCategoriaFilterName={categoriaFilterName}
                initialSearchPhrase={searchPhrase}
                onDismiss={() => {
                    setShowFiltersModal(false)
                }}
                onFilterUpdate={onFilterUpdate} />
            <Portal>
                <Dialog visible={showTipoDocFilter} onDismiss={() => { setShowTipoDocFilter(false) }}>
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
                onRefresh={() => { getData(null, null, null, null, searchPhrase) }}
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