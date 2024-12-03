import { View, InteractionManager, FlatList } from "react-native"
import { Link, useNavigation, Stack, router, useFocusEffect } from "expo-router";
import { IconButton, useTheme, DataTable, Text, TextInput, Portal, Dialog, List, Button } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useContext, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import { DateTime } from "luxon";
import numeral from "numeral"
import "numeral/locales/es-es";

import Reanimated, { Extrapolation, interpolate, LinearTransition, useAnimatedStyle } from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated from "react-native-reanimated";
import ListDocsFilters from "../../components/ListDocsFilters";

export default () => {
    numeral.locale("es-es")

    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix } = useContext(ScppContext);
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

    // Para ejecutar algo cuando navegan a esta pantalla
    // React Navigation runs its animations in native thread, so it's not a problem in many cases. But if the effect updates 
    // the UI or renders something expensive, then it can affect the animation performance. In such cases, we can use InteractionManager 
    // to defer our work until the animations or gestures have finished:
    useFocusEffect(
        useCallback(() => {
            //useState<string>("Gastos") no se reseteaba al navegar de vuelta
            //( si reseteaba pero no se veia en la UI)
            // resetamos a mano para forzar la actualizacion
            setTipoDocFilterName("Gastos")
            setFechaInicio(DateTime.local().startOf("month"))
            setFechaTermino(DateTime.local().endOf("month"))
            setTipoDocFilterName("Gastos")
            setCategoriaFilterName("(Todos)")
            setSearchPhrase(undefined)

            const task = InteractionManager.runAfterInteractions(() => {
                getData(null, null, null, null, searchPhrase)
            })
            return () => task.cancel();
        }, [useNavigation().isFocused()])
    );

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
    }, [])

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
        if(localCategoriaId == -1) {
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
    ]
    );

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
    },
        [theme, router, getData, apiPrefix, sessionHash, appStyles]
    );

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
            <View style={{ justifyContent: "space-between", flexDirection: "row", backgroundColor: theme.colors.background }}>
                <View style={appStyles.btnRow}>
                    <Link href="/docs/add-doc" asChild>
                        <IconButton
                            style={appStyles.btnRowBtn}
                            icon="plus"
                            mode="contained-tonal"
                            containerColor={theme.colors.primary}
                            iconColor={theme.colors.onPrimary}
                        />
                    </Link>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="filter"
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        onPress={() => { setShowFiltersModal(true) }}
                    />
                </View>
                <View style={appStyles.btnRow}>
                    <TextInput label='Tipo Doc'
                        style={{ width: 140 }}
                        mode="outlined"
                        editable={false}
                        dense={true}
                        value={tipoDocFilterName}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowTipoDocFilter(true) }} />}
                    />
                </View>
            </View>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={{ flex: 0.5 }}>Fecha</DataTable.Title>
                    <DataTable.Title>Proposito</DataTable.Title>
                    <DataTable.Title numeric style={{ flex: 0.5 }}>Monto</DataTable.Title>
                </DataTable.Header>
            </DataTable>
            {(docsList.length == 0 && !getDocsApiCalling) &&
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay Datos</Text>
            }
            <Animated.FlatList
                data={docsList}
                onRefresh={() => { getData(null, null, null, null, searchPhrase) }}
                refreshing={getDocsApiCalling}
                keyExtractor={(item) => item.id.toString()}
                itemLayoutAnimation={LinearTransition}
                renderItem={({ item }) => (
                    <ReanimatedSwipeable
                        renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
                        key={item.id}
                        friction={1}
                    >
                        <View style={{ backgroundColor: theme.colors.background, flexDirection: 'row', padding: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant }}>
                            <View style={{ flex: 0.6 }}>
                                <Text style={appStyles.textFontSize}>{item.fecha}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={appStyles.textFontSize}>{item.proposito}</Text>
                            </View>
                            <View style={{ flex: 0.6, alignSelf: "flex-end" }}>
                                <Text style={[appStyles.textFontSize, { textAlign: "right" }]}>{numeral(item.monto).format("0,0")}</Text>
                            </View>
                        </View>
                    </ReanimatedSwipeable>
                )}
            />
            <View style={appStyles.totalDiv} >
                <Text style={appStyles.textFontSize}>Total $ {numeral(sumaTotalDocs).format('0,0')}</Text>
            </View>
        </View>

    )
}