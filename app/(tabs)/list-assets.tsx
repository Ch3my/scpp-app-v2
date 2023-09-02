import { ScrollView, View, Animated, InteractionManager } from "react-native"
import { Link, useNavigation, Stack, router, useFocusEffect } from "expo-router";
import { IconButton, useTheme, DataTable, Text, Portal, Dialog, Button } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useCallback, useContext } from 'react';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import { ScppThemeContext } from '../ScppThemeContext';

// https://software-mansion.github.io/react-native-gesture-handler/docs/component-swipeable.html
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { paperTheme } = useContext(ScppThemeContext);
    const { sessionHash, apiPrefix } = useContext(ScppContext);
    const [assetList, setAssetList] = useState<Asset[]>([])

    const [getAssetsApiCalling, setGetAssetsApiCalling] = useState<boolean>(true)
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
    const [selectedId, setSelectedId] = useState<number>(0)

    const getData = async () => {
        setGetAssetsApiCalling(true)
        try {
            const response: AxiosResponse<any> = await axios.get(apiPrefix + '/assets', {
                params: {
                    sessionHash
                }
            });
            if (response.data) {
                setAssetList(response.data)
            }
        } catch (error) {
            console.log(error);
        }
        setGetAssetsApiCalling(false)
    }
    const deleteAsset = async () => {
        try {
            await axios.delete(apiPrefix + '/assets', { data: { id: selectedId, sessionHash } })
            getData()
        } catch (error) {
            console.log(error)
        }
        setSelectedId(0)
    }

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
            router.push("/assets/edit/" + id)
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
                        onPress={() => {
                            setShowConfirmDelete(true)
                            setSelectedId(id)
                        }}
                    />
                </Animated.View>
                <Animated.View style={{
                    backgroundColor: theme.colors.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateX: translateEdit }]
                }}>
                    <IconButton
                        icon="eye"
                        iconColor={theme.colors.onSecondary}
                        onPress={() => { editAction() }}
                    />
                </Animated.View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Assets" }} />
            <Portal>
                <Dialog visible={showConfirmDelete} onDismiss={() => { setShowConfirmDelete(false) }}>
                    <Dialog.Title>Confirme por Favor</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">¿Seguro que quiere eliminar el registro?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setShowConfirmDelete(false)
                            deleteAsset()
                        }}>SI</Button>
                        <Button onPress={() => {
                            setShowConfirmDelete(false)
                            setSelectedId(0)
                        }}>NO</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <View style={appStyles.btnRow}>
                <Link href="/assets/add-asset" asChild>
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
                        <DataTable.Title >Descripcion</DataTable.Title>
                    </DataTable.Header>
                    {getAssetsApiCalling &&
                        <DataTable.Row>
                            <DataTable.Cell style={{ justifyContent: "center" }}>Cargando...</DataTable.Cell>
                        </DataTable.Row>
                    }
                    {!getAssetsApiCalling && assetList.map((item) => (
                        <Swipeable
                            renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
                            key={item.id}
                            friction={1}>
                            <DataTable.Row>
                                <DataTable.Cell style={{ flex: 0.5 }}>{item.fecha}</DataTable.Cell>
                                <DataTable.Cell>{item.descripcion}</DataTable.Cell>
                            </DataTable.Row>
                        </Swipeable>
                    ))}
                    {(assetList.length == 0 && !getAssetsApiCalling) &&
                        <DataTable.Row>
                            <DataTable.Cell style={{ justifyContent: "center" }}>No hay Datos</DataTable.Cell>
                        </DataTable.Row>
                    }
                </DataTable>
            </ScrollView>
        </View>
    )
}