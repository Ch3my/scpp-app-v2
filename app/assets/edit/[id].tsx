import {
    StyleSheet, Text, TouchableOpacity,
    View, ScrollView, Image, Modal
} from 'react-native';
import { Link, Stack, router } from "expo-router";
import { useEffect, useState, useRef, useContext } from 'react';
import { GetAppStyles } from "../../../styles/styles"
import {
    IconButton, useTheme, Button, TextInput,
    Portal, Dialog, List, Snackbar
} from 'react-native-paper';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../../ScppContext"
import { useLocalSearchParams } from 'expo-router';
import { PinchGestureHandler, State, Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, GestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

export default () => {
    // TODO manejar permiso denegado, mostrar mensaje, etc
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
                        sessionHash
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
            <Snackbar
                visible={showSnackBar}
                style={{ zIndex: 999 }}
                onDismiss={() => { setShowSnackBar(false) }}>
                {snackbarMsg}
            </Snackbar>
            <View style={[appStyles.btnRow, { backgroundColor: theme.colors.background, padding: 10 }]}>
                <IconButton
                    style={appStyles.btnRowBtn}
                    icon="delete"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={deleteAsset}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <TextInput label='Descripción'
                    style={{ marginBottom: 5 }}
                    editable={false}
                    mode="outlined"
                    value={assetDescription}
                    autoCapitalize="none"
                    onChangeText={text => setAssetDescription(text)} />
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha"
                    mode="outlined"
                    editable={false}
                    value={assetDate.toFormat('yyyy-MM-dd')}
                />

                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Categoria"
                    mode="outlined"
                    editable={false}
                    value={assetCatName}
                />
                <View style={appStyles.centerContentContainer}>
                    {assetAssetData &&
                        <TouchableOpacity onPress={() => { setShowImgModal(true) }} style={appStyles.camera}>
                            <Image
                                style={{ flex: 1 }}
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
                onRequestClose={() => {
                    setShowImgModal(!showImgModal)
                }}>
                <IconButton icon="close"
                    iconColor={theme.colors.onPrimaryContainer}
                    containerColor={theme.colors.primaryContainer}
                    mode="contained"
                    style={{ position: "absolute", right: 15, zIndex: 999 }}
                    onPress={() => { setShowImgModal(!showImgModal) }} />
                <GestureHandlerRootView style={{ flex: 1 }} >
                    <View style={{flex:1, backgroundColor: theme.colors.background }}>
                        <GestureDetector gesture={panGesture}>
                            <GestureDetector gesture={pinchGesture}>
                                <Animated.Image
                                    style={[{ flex: 1 }, animatedStyle]}
                                    source={{ uri: assetAssetData }} />
                            </GestureDetector>
                        </GestureDetector>
                    </View>
                </GestureHandlerRootView>
            </Modal>
        </View>
    )
}