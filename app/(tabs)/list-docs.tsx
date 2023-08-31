import { ScrollView, View, Animated, InteractionManager } from "react-native"
import { Link, useNavigation, Redirect, Stack, router, useFocusEffect } from "expo-router";
import { IconButton, useTheme, DataTable, Text } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios'
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

    const [fechaInicio, setFechaInicio] = useState<DateTime>(DateTime.local().startOf("month"))
    const [fechaTermino, setFechaTermino] = useState<DateTime>(DateTime.local().endOf("month"))
    const [tipoDocFilterId, setTipoDocFilterId] = useState<number>(1)
    const [sumaTotalDocs, setSumaTotalDocs] = useState<number>(0)

    const [getDocsApiCalling, setGetDocsApiCalling] = useState<boolean>(true)

    const setFechaToTipoDoc = () => {
        const currentDate = DateTime.local()
        if (tipoDocFilterId == 1) {
            // Gastos
            setFechaInicio(currentDate.startOf('month'))
            setFechaTermino(currentDate.endOf('month'))
            return
        }
        setFechaInicio(currentDate.startOf('year'))
        setFechaTermino(currentDate.endOf('year'))
    }

    const getData = async () => {
        setSumaTotalDocs(0)
        setGetDocsApiCalling(true)
        try {
            const response: AxiosResponse<any> = await axios.get(apiPrefix + '/documentos', {
                params: {
                    fechaInicio: fechaInicio.toFormat('yyyy-MM-dd'),
                    fechaTermino: fechaTermino.toFormat('yyyy-MM-dd'),
                    fk_tipoDoc: tipoDocFilterId,
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

    // Para ejecutar algo cuando navegan a esta pantalla
    // React Navigation runs its animations in native thread, so it's not a problem in many cases. But if the effect updates 
    // the UI or renders something expensive, then it can affect the animation performance. In such cases, we can use InteractionManager 
    // to defer our work until the animations or gestures have finished:
    useFocusEffect(
        useCallback(() => {
            const task = InteractionManager.runAfterInteractions(() => {
                getData()
            })
            return () => task.cancel();
        }, [useNavigation().isFocused()])
    );

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
                getData()
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
            <View style={[appStyles.btnRow, { backgroundColor: theme.colors.background, padding: 10 }]}>
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
                    onPress={() => { getData() }}
                />
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