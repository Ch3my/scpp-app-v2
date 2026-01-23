import {
    TouchableOpacity,
    View, ScrollView, Image, Modal, Text,
    SafeAreaView
} from 'react-native';
import { Stack, router } from "expo-router";
import { useEffect, useState, useContext } from 'react';
import { GetAppStyles } from "../../../styles/styles"
import { useTheme } from '../../ScppThemeContext';
import { AppIconButton } from '../../../components/ui/AppIconButton';
import { AppButton } from '../../../components/ui/AppButton';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppDialog } from '../../../components/ui/AppDialog';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../../ScppContext"
import { useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix, isReady } = useContext(ScppContext);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const positionX = useSharedValue(0);
    const positionY = useSharedValue(0);

    const lastX = useSharedValue(0);
    const lastY = useSharedValue(0);

    const [showImgModal, setShowImgModal] = useState<boolean>(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

    let [assetDescription, setAssetDescription] = useState<string>("")
    let [assetDate, setAssetDate] = useState<DateTime>(DateTime.local())
    let [assetCatName, setAssetCatName] = useState<string>("")
    let [assetAssetData, setAssetAssetData] = useState<string>("")

    const { id } = useLocalSearchParams();

    useEffect(() => {
        const getData = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/assets', {
                    params: {
                        sessionHash,
                        id: [id]
                    }
                });
                if (response.data) {
                    let asset = response.data[0]
                    setAssetDescription(asset.descripcion)
                    setAssetCatName(asset.categoria.descripcion)
                    setAssetAssetData(asset.assetData)
                    setAssetDate(DateTime.fromFormat(asset.fecha, "yyyy-MM-dd"))
                }
            } catch (error) {
                console.log(error);
            }
        }
        getData()
    }, [])

    const deleteAsset = async () => {
        try {
            await axios.delete(apiPrefix + '/assets', { data: { id, sessionHash } })
            router.back()
        } catch (error) {
            console.log(error)
        }
    }
    const closeImgModal = () => {
        setShowImgModal(!showImgModal)
        scale.value = 1
        savedScale.value = 1
        positionX.value = 0
        positionY.value = 0
        lastX.value = 0
        lastY.value = 0
    }

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            positionX.value = lastX.value + e.translationX;
            positionY.value = lastY.value + e.translationY;
        })
        .onEnd((e) => {
            lastX.value = positionX.value
            lastY.value = positionY.value
        }).minDistance(25).maxPointers(1)

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: positionX.value }, { translateY: positionY.value }, { scale: scale.value }],
    }));

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Ver Asset" }} />
            <AppDialog visible={showConfirmDelete} onDismiss={() => { setShowConfirmDelete(false) }}>
                <AppDialog.Title>Confirme por Favor</AppDialog.Title>
                <AppDialog.Content>
                    <Text style={appStyles.bodyMedium}>¿Seguro que quiere eliminar el registro?</Text>
                </AppDialog.Content>
                <AppDialog.Actions>
                    <AppButton mode="text" onPress={deleteAsset}>SI</AppButton>
                    <AppButton mode="text" onPress={() => {
                        setShowConfirmDelete(false)
                    }}>NO</AppButton>
                </AppDialog.Actions>
            </AppDialog>
            <View style={[appStyles.btnRow, appStyles.onlyBtnRow]}>
                <AppIconButton
                    icon="delete"
                    size={30}
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={() => { setShowConfirmDelete(true) }}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <AppTextInput label='Descripción'
                    style={{ marginBottom: 5 }}
                    editable={false}
                    mode="flat"
                    dense={true}
                    value={assetDescription}
                    autoCapitalize="none"
                    onChangeText={text => setAssetDescription(text)} />
                <AppTextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={assetDate.toFormat('yyyy-MM-dd')}
                />
                <AppTextInput
                    style={{ marginBottom: 5 }}
                    label="Categoria"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={assetCatName}
                />
                <View style={appStyles.centerContentContainer}>
                    {assetAssetData &&
                        <TouchableOpacity onPress={() => { setShowImgModal(true) }} style={{ height: 500, width: "100%" }}>
                            <Image
                                style={{ flex: 1 }}
                                resizeMode="contain"
                                source={{ uri: assetAssetData }} />
                        </TouchableOpacity>
                    }
                </View>
                <View style={{ margin: 10 }}>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                visible={showImgModal}
                transparent={true}
                onRequestClose={closeImgModal}>
                <AppIconButton icon="close"
                    iconColor={theme.colors.onPrimaryContainer}
                    containerColor={theme.colors.primaryContainer}
                    mode="contained"
                    size={30}
                    style={{ position: "absolute", right: 15, zIndex: 999 }}
                    onPress={closeImgModal} />
                <GestureHandlerRootView style={{ flex: 1 }} >
                    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                        <GestureDetector gesture={panGesture}>
                            <GestureDetector gesture={pinchGesture}>
                                <Animated.Image
                                    style={[{ flex: 1 }, animatedStyle]}
                                    source={{ uri: assetAssetData }}
                                    resizeMode="contain" />
                            </GestureDetector>
                        </GestureDetector>
                    </View>
                </GestureHandlerRootView>
            </Modal>
        </SafeAreaView>
    )
}
