import { ScrollView, View, InteractionManager, Text } from "react-native"
import { Link, useNavigation, Stack, router, useFocusEffect } from "expo-router";
import { useTheme } from '../ScppThemeContext';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useCallback, useContext } from 'react';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"

import Reanimated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Asset } from "../../models/Asset";
import { AppIconButton } from "../../components/ui/AppIconButton";
import { AppDialog } from "../../components/ui/AppDialog";
import { AppButton } from "../../components/ui/AppButton";

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
    );

    const rightSwipe = (progress: any, dragX: any, id: number) => {
        const containerStyle = useAnimatedStyle(() => {
            const translateX = interpolate(
                progress.value,
                [0, 1],
                [100, 0], // Move the whole 100px block
                Extrapolation.CLAMP
            );
            return {
                transform: [{ translateX }],
                flexDirection: 'row',
                width: 100,
            };
        });
        const editAction = () => {
            router.push("/assets/edit/" + id)
        }

        return (
            <Reanimated.View style={containerStyle}>
                <View style={{ flex: 1, backgroundColor: theme.colors.error, justifyContent: 'center', alignItems: 'center' }}>
                    <AppIconButton
                        icon="delete"
                        iconColor={theme.colors.onError}
                        onPress={() => {
                            setShowConfirmDelete(true)
                            setSelectedId(id)
                        }}
                    />
                </View>
                <View style={{ flex: 1, backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center' }}>
                    <AppIconButton
                        icon="eye"
                        iconColor={theme.colors.onSecondary}
                        onPress={() => { editAction() }}
                    />
                </View>
            </Reanimated.View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Assets" }} />
            <AppDialog visible={showConfirmDelete} onDismiss={() => { setShowConfirmDelete(false) }}>
                <AppDialog.Title>Confirme por Favor</AppDialog.Title>
                <AppDialog.Content>
                    <Text style={appStyles.bodyMedium}>¿Seguro que quiere eliminar el registro?</Text>
                </AppDialog.Content>
                <AppDialog.Actions>
                    <AppButton mode="text" onPress={() => {
                        setShowConfirmDelete(false)
                        deleteAsset()
                    }}>SI</AppButton>
                    <AppButton mode="text" onPress={() => {
                        setShowConfirmDelete(false)
                        setSelectedId(0)
                    }}>NO</AppButton>
                </AppDialog.Actions>
            </AppDialog>
            <View style={[appStyles.btnRow, appStyles.onlyBtnRow]}>
                <Link href="/assets/add-asset" asChild>
                    <AppIconButton
                        icon="plus"
                        size={30}
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        onPress={() => { }}
                    />
                </Link>
                <AppIconButton
                    icon="refresh"
                    size={30}
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={() => { getData() }}
                />
            </View>
            <ScrollView style={appStyles.container}>
                {/* DataTable Header */}
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: theme.colors.surfaceVariant,
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                }}>
                    <Text style={[appStyles.textFontSize, { flex: 0.5, fontWeight: '500' }]}>Fecha</Text>
                    <Text style={[appStyles.textFontSize, { flex: 1, fontWeight: '500' }]}>Descripcion</Text>
                </View>

                {getAssetsApiCalling && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={appStyles.textFontSize}>Cargando...</Text>
                    </View>
                )}

                {!getAssetsApiCalling && assetList.map((item) => (
                    <ReanimatedSwipeable
                        renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
                        key={item.id}
                        friction={1}>
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: theme.colors.background,
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.outlineVariant,
                        }}>
                            <Text style={[appStyles.textFontSize, { flex: 0.5 }]}>{item.fecha}</Text>
                            <Text style={[appStyles.textFontSize, { flex: 1 }]}>{item.descripcion}</Text>
                        </View>
                    </ReanimatedSwipeable>
                ))}

                {(assetList.length == 0 && !getAssetsApiCalling) && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={appStyles.textFontSize}>No hay Datos</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}
