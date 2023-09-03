import { ScrollView, View, Animated, InteractionManager, FlatList } from "react-native"
import { Link, useNavigation, Redirect, Stack, router, useFocusEffect } from "expo-router";
import { IconButton, useTheme, DataTable, Text, TextInput, Portal, Dialog, List, Button } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useRef, useContext, useCallback, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios'
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScppContext } from "../ScppContext"
import { ScppThemeContext } from '../ScppThemeContext';
import { DateTime } from "luxon";
import numeral from "numeral"
import "numeral/locales/es-es";

// https://software-mansion.github.io/react-native-gesture-handler/docs/component-swipeable.html
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
    const [showFechaInicioPicker, setShowFechaInicioPicker] = useState<boolean>(false)
    const [showFechaTerminoPicker, setShowFechaTerminoPicker] = useState<boolean>(false)

    const [tipoDocFilterName, setTipoDocFilterName] = useState<string>("Gastos")
    const [categoriaFilterName, setCategoriaFilterName] = useState<string>("(Todos)")

    const [showTipoDocFilter, setShowTipoDocFilter] = useState<boolean>(false)
    const [listOfCategoria, setListOfCategoria] = useState<Categoria[]>([])
    const [listOfTipoDoc, setListOfTipoDoc] = useState<TipoDoc[]>([])
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false)

    // Para ejecutar algo cuando navegan a esta pantalla
    // React Navigation runs its animations in native thread, so it's not a problem in many cases. But if the effect updates 
    // the UI or renders something expensive, then it can affect the animation performance. In such cases, we can use InteractionManager 
    // to defer our work until the animations or gestures have finished:
    useFocusEffect(
        useCallback(() => {
            const task = InteractionManager.runAfterInteractions(() => {
                getData(null, null, null, null)
            })
            return () => task.cancel();
        }, [useNavigation().isFocused()])
    );

    useEffect(() => {
        const getCategorias = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/categorias', {
                    params: {
                        sessionHash
                    }
                });
                if (response.data) {
                    // Add the item to the top of the array
                    const modifiedData = [
                        { id: null, descripcion: "(Todos)" },
                        ...response.data
                    ];
                    setListOfCategoria(modifiedData)
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

    const getData = async (aFechaInicio: DateTime | null,
        aFechaTermino: DateTime | null,
        afk_tipoDoc: number | null,
        afk_categoria: number | null) => {
        // Si vienen argumentos usamos argumentos, sino usamos el estado
        // como se hace queue de los setState el argumento (si existe) esta mas actualizado el que State
        setSumaTotalDocs(0)
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
        let localCategoriaId = categoriaFilterId
        if (afk_categoria) {
            localCategoriaId = afk_categoria
        }
        try {
            const response: AxiosResponse<any> = await axios.get(apiPrefix + '/documentos', {
                params: {
                    fechaInicio: localFechaInicio?.toFormat('yyyy-MM-dd'),
                    fechaTermino: localFechaTermino?.toFormat('yyyy-MM-dd'),
                    fk_tipoDoc: localTipoDocId,
                    fk_categoria: localCategoriaId,
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
    }

    const onUpdateCategoria = ({ id, descripcion }: { id: number | null, descripcion: string }) => {
        setCategoriaFilterId(id)
        setCategoriaFilterName(descripcion)
        setShowCategoriaList(false)
    }
    const onUpdateTipoDoc = async ({ id, descripcion }: { id: number, descripcion: string }) => {
        let [newFecIni, newFecTer] = setFechaToTipoDoc(id)
        setTipoDocFilterId(id)
        setTipoDocFilterName(descripcion)
        setShowTipoDocFilter(false)
        getData(newFecIni, newFecTer, id, null)
    }
    const onChangeFechaIniFilter = (event: any, selectedDate?: Date) => {
        setShowFechaInicioPicker(false)
        if (selectedDate) {
            setFechaInicio(DateTime.fromJSDate(selectedDate))
        }
    }
    const onChangeFechaTerminoFilter = (event: any, selectedDate?: Date) => {
        setShowFechaTerminoPicker(false)
        if (selectedDate) {
            setFechaTermino(DateTime.fromJSDate(selectedDate))
        }
    }

    const rightSwipe = (progress: any, dragX: any, id: number) => {
        // outputRange: [100, 1] contiene el largo del item
        const translateEdit = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 1],
            extrapolate: 'clamp',
        });
        const translateDelete = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 1],
            extrapolate: 'clamp',
        });
        const editAction = () => {
            router.push("/docs/edit/" + id)
        }
        const deleteDoc = async () => {
            try {
                await axios.delete(apiPrefix + '/documentos', { data: { id, sessionHash } })
                getData(null, null, null, null)
            } catch (error) {
                console.log(error)
            }
        }

        return (
            <View style={{ flexDirection: 'row', width: 100 }}>
                <Animated.View style={{
                    backgroundColor: theme.colors.error,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateX: translateDelete }]
                }}>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="delete"
                        iconColor={theme.colors.onError}
                        onPress={() => { deleteDoc() }}
                    />
                </Animated.View>
                <Animated.View style={{
                    backgroundColor: theme.colors.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateX: translateEdit }]
                }}>
                    <IconButton
                        icon="file-edit"
                        iconColor={theme.colors.onSecondary}
                        onPress={() => { editAction() }}
                    />
                </Animated.View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Documentos" }} />
            <Portal>
                <Dialog visible={showFiltersModal} onDismiss={() => {
                    setShowFiltersModal(false)
                    getData(null, null, null, null)
                }}>
                    <Dialog.Title>Filtros</Dialog.Title>
                    <Dialog.ScrollArea>
                        <TextInput
                            style={{ marginBottom: 5 }}
                            label="Categoria"
                            mode="flat"
                            dense={true}
                            editable={false}
                            value={categoriaFilterName}
                            right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowCategoriaList(true) }} />}
                        />
                        <TextInput
                            style={{ marginBottom: 5 }}
                            label="Fecha Inicio"
                            mode="flat"
                            dense={true}
                            editable={false}
                            value={fechaInicio?.toFormat('yyyy-MM-dd')}
                            right={<TextInput.Icon icon="calendar" onPress={() => { setShowFechaInicioPicker(true) }} />}
                        />
                        {(showFechaInicioPicker && fechaInicio) && (
                            <DateTimePicker value={fechaInicio.toJSDate()} mode="date"
                                display="default" onChange={onChangeFechaIniFilter}
                            />
                        )}
                        <TextInput
                            style={{ marginBottom: 5 }}
                            label="Fecha Termino"
                            mode="flat"
                            dense={true}
                            editable={false}
                            value={fechaTermino?.toFormat('yyyy-MM-dd')}
                            right={<TextInput.Icon icon="calendar" onPress={() => {
                                console.log("setShowFechaTerminoPicker(true)")
                                setShowFechaTerminoPicker(true)
                            }} />}
                        />
                        {(showFechaTerminoPicker && fechaTermino) && (
                            <DateTimePicker value={fechaTermino.toJSDate()} mode="date"
                                display="default" onChange={onChangeFechaTerminoFilter}
                            />
                        )}
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setShowFiltersModal(false)
                            getData(null, null, null, null)
                        }}>LISTO</Button>
                    </Dialog.Actions>
                </Dialog>
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
                        icon="refresh"
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        onPress={() => { getData(null, null, null, null) }}
                    />
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
            <ScrollView style={appStyles.container}>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={{ flex: 0.5 }}>Fecha</DataTable.Title>
                        <DataTable.Title>Proposito</DataTable.Title>
                        <DataTable.Title numeric style={{ flex: 0.5 }}>Monto</DataTable.Title>
                    </DataTable.Header>
                    {getDocsApiCalling &&
                        <DataTable.Row>
                            <DataTable.Cell style={{ justifyContent: "center" }}>Cargando...</DataTable.Cell>
                        </DataTable.Row>
                    }
                    {!getDocsApiCalling && docsList.map((item) => (
                        <Swipeable
                            renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
                            key={item.id}
                            friction={1}>
                            <DataTable.Row>
                                <DataTable.Cell style={{ flex: 0.5 }}>{item.fecha}</DataTable.Cell>
                                <DataTable.Cell>{item.proposito}</DataTable.Cell>
                                <DataTable.Cell style={{ flex: 0.5 }} numeric>{numeral(item.monto).format("0,0")}</DataTable.Cell>
                            </DataTable.Row>
                        </Swipeable>
                    ))}
                    {(docsList.length == 0 && !getDocsApiCalling) &&
                        <DataTable.Row>
                            <DataTable.Cell style={{ justifyContent: "center" }}>No hay Datos</DataTable.Cell>
                        </DataTable.Row>
                    }
                </DataTable>
                <View style={appStyles.totalDiv} >
                    <Text>Total $ {numeral(sumaTotalDocs).format('0,0')}</Text>
                </View>
                <View style={{ margin: 10 }}></View>
            </ScrollView>
        </View>

    )
}