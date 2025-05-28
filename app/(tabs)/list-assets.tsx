import { ScrollView, View, InteractionManager } from "react-native"
import { Link, useNavigation, Stack, router, useFocusEffect } from "expo-router";
import { IconButton, useTheme, DataTable, Text, Portal, Dialog, Button } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useCallback, useContext } from 'react';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"

import Reanimated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Asset } from "../../models/Asset";

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
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
        }, [])
        // Para que no es necesario especificar nada en []
    );

    const rightSwipe = (progress: any, dragX: any, id: number) => {
        // outputRange: [100, 1] contiene el largo del item
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
            router.push("/assets/edit/" + id)
        }
        return (
            <Reanimated.View style={{ flexDirection: 'row', width: 100 }}>
                <Reanimated.View style={deleteStyle}>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="delete"
                        iconColor={theme.colors.onError}
                        onPress={() => {
                            setShowConfirmDelete(true)
                            setSelectedId(id)
                        }}
                    />
                </Reanimated.View>
                <Reanimated.View style={editStyle}>
                    <IconButton
                        icon="eye"
                        iconColor={theme.colors.onSecondary}
                        onPress={() => { editAction() }}
                    />
                </Reanimated.View>
            </Reanimated.View>
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
                        size={30}
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                    />
                </Link>
                <IconButton
                    style={appStyles.btnRowBtn}
                    icon="refresh"
                    size={30}
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
                        <ReanimatedSwipeable
                            renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
                            key={item.id}
                            friction={1}>
                            <DataTable.Row>
                                <DataTable.Cell style={{ flex: 0.5 }}>
                                    <Text style={appStyles.textFontSize}>{item.fecha}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <Text style={appStyles.textFontSize}>{item.descripcion}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        </ReanimatedSwipeable>
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