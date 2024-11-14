import {
    StyleSheet, TouchableOpacity,
    View, ScrollView, Image, Modal
} from 'react-native';
import { Link, Stack, router } from "expo-router";
import { useEffect, useState, useRef, useContext } from 'react';
import { GetAppStyles } from "../../../styles/styles"
import {
    IconButton, useTheme, Button, TextInput,
    Portal, Dialog, Snackbar, Text
} from 'react-native-paper';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../../ScppContext"
import { useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector, GestureHandlerRootView, GestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

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

    const [showSnackBar, setShowSnackBar] = useState<boolean>(false);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");
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
    // https://github.com/kesha-antonov/react-native-zoom-reanimated/blob/main/index.tsx#L208 
    // puede ser una opcion, ya lo habia hecho asi que namas
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

    // Sin GestureHandlerRootView dentro de modal no se ejecutaban los gestos
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Ver Asset" }} />
            <Portal>
                <Snackbar
                    duration={2500}
                    visible={showSnackBar}
                    style={{ zIndex: 999 }}
                    onDismiss={() => { setShowSnackBar(false) }}>
                    {snackbarMsg}
                </Snackbar>
            </Portal>
            <Portal>
                <Dialog visible={showConfirmDelete} onDismiss={() => { setShowConfirmDelete(false) }}>
                    <Dialog.Title>Confirme por Favor</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">¿Seguro que quiere eliminar el registro?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={deleteAsset}>SI</Button>
                        <Button onPress={() => {
                            setShowConfirmDelete(false)
                        }}>NO</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <View style={[appStyles.btnRow]}>
                <IconButton
                    style={appStyles.btnRowBtn}
                    icon="delete"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={() => { setShowConfirmDelete(true) }}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <TextInput label='Descripción'
                    style={{ marginBottom: 5 }}
                    editable={false}
                    mode="flat"
                    dense={true}
                    value={assetDescription}
                    autoCapitalize="none"
                    onChangeText={text => setAssetDescription(text)} />
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={assetDate.toFormat('yyyy-MM-dd')}
                />
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Categoria"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={assetCatName}
                />
                <View style={appStyles.centerContentContainer}>
                    {assetAssetData &&
                        <TouchableOpacity onPress={() => { setShowImgModal(true) }} style={appStyles.camera}>
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
                <IconButton icon="close"
                    iconColor={theme.colors.onPrimaryContainer}
                    containerColor={theme.colors.primaryContainer}
                    mode="contained"
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
        </View>
    )
}