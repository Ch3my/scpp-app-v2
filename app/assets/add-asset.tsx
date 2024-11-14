import {
    View, ScrollView, Image, FlatList,
    Modal, Text
} from 'react-native';
import { Stack } from "expo-router";
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { GetAppStyles } from "../../styles/styles"
import {
    IconButton, MD3Colors, useTheme, Button, TextInput,
    Portal, Dialog, List, Snackbar,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import { ConvertToBase64 } from "../../helpers/base64-file-enconder"
import { CompressAndResizeImage } from "../../helpers/img-compressor"

export default () => {
    // TODO manejar permiso denegado, mostrar mensaje, etc
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix, isReady } = useContext(ScppContext);

    const [cameraPermission, setCameraPermission] = useState<string | null>(null);
    const [type, setType] = useState<CameraType>("back");
    const [photoLocation, setPhotoLocation] = useState<string | undefined>(undefined);
    const cameraRef = useRef<CameraView | null>(null)
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false);
    const [showSnackBar, setShowSnackBar] = useState<boolean>(false);
    const [cameraWorking, setCameraWorking] = useState<boolean>(false);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");
    const [rotation, setRotation] = useState(0);

    let [assetDescription, setAssetDescription] = useState<string>("")
    let [assetDate, setAssetDate] = useState<Date>(new Date())
    let [assetCatId, setAssetCatId] = useState<number | null>(1)
    let [assetCatName, setAssetCatName] = useState<string>("")
    const [listOfCategoria, setListOfCategoria] = useState<Categoria[]>([])

    useEffect(() => {
        const async = async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync()
            setCameraPermission(cameraStatus.status)
        }
        const getCategorias = async () => {
            try {
                const response: AxiosResponse<any> = await axios.get(apiPrefix + '/categorias', {
                    params: {
                        sessionHash
                    }
                });
                if (response.data) {
                    setListOfCategoria(response.data)
                }
            } catch (error) {
                console.log(error);
            }
        };
        async()
        getCategorias();
    }, [])

    const toggleCameraType = () => {
        setType(current => (current === "back" ? "front" : "back"));
    }
    const takePicture = async () => {
        setRotation(0)
        setCameraWorking(true)
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setPhotoLocation(photo?.uri)
                setShowCamera(false)
            } catch (error) {
                console.log(error)
            }
        }
        setCameraWorking(false)
    }
    const onChangeDatePicker = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setAssetDate(selectedDate)
        }
    }
    const onUpdateCategoria = ({ id, descripcion }: { id: number | null, descripcion: string }) => {
        setAssetCatId(id)
        setAssetCatName(descripcion)
        setShowCategoriaList(false)
    }
    const saveAsset = async () => {
        setShowSnackBar(false)
        if (!photoLocation) {
            setSnackbarMsg("Todos los campos son Obligatorios")
            setShowSnackBar(true)
            return
        }
        if (assetCatName == "") {
            setSnackbarMsg("Todos los campos son Obligatorios")
            setShowSnackBar(true)
            return
        }
        if (assetDescription == "") {
            setSnackbarMsg("Todos los campos son Obligatorios")
            setShowSnackBar(true)
            return
        }
        let compressImgUri = await CompressAndResizeImage(photoLocation, rotation)
        let encondedFile = await ConvertToBase64(compressImgUri)
        let apiArgs = {
            fk_categoria: assetCatId,
            descripcion: assetDescription,
            assetData: encondedFile.base64String,
            fecha: DateTime.fromJSDate(assetDate).toFormat('yyyy-MM-dd'),
            sessionHash
        }
        let response = await axios.post(apiPrefix + '/assets', apiArgs)
        if (response.data.hasErrors) {
            setSnackbarMsg("Error al guardar Asset")
            setShowSnackBar(true)
            return
        }
        setSnackbarMsg("Asset guardado con Exito")
        setShowSnackBar(true)
    }

    const cameraReady = useCallback(() => {
        setCameraWorking(false);
    }, []);

    const prepareCamera = useCallback(() => {
        setShowCamera(true);
        setCameraWorking(true);
    }, []);

    const rotateLeft = useCallback(() => {
        setRotation((prevRotation) => (prevRotation - 90) % 360);
    }, []);

    const rotateRight = useCallback(() => {
        setRotation((prevRotation) => (prevRotation + 90) % 360);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Agregar Asset" }} />
            <Modal
                animationType="slide"
                visible={showCamera}
                onRequestClose={() => {
                    setShowCamera(false)
                }}>
                {showCamera &&
                    <>
                        <CameraView style={{ flex: 1, marginBottom: 20 }} facing={type}
                            ref={cameraRef} animateShutter={false}
                            onCameraReady={cameraReady} />
                        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
                            <Button icon="camera" mode="contained-tonal" onPress={toggleCameraType}>
                                Flip Camara
                            </Button>
                            <Button icon="camera" mode="contained" onPress={takePicture} loading={cameraWorking}>
                                Tomar Foto
                            </Button>
                        </View>
                    </>
                }
            </Modal>
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
            <View style={[appStyles.btnRow]}>
                <IconButton
                    style={appStyles.btnRowBtn}
                    icon="content-save"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={saveAsset}
                />
            </View>
            <ScrollView style={appStyles.container}>
                <TextInput label='Descripción'
                    style={{ marginBottom: 5 }}
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
                    value={DateTime.fromJSDate(assetDate).toFormat('yyyy-MM-dd')}
                    right={<TextInput.Icon icon="calendar" onPress={() => { setShowDatePicker(true) }} />}
                />
                {showDatePicker && (
                    <DateTimePicker testID="dateTimePicker" value={assetDate} mode="date"
                        display="default" onChange={onChangeDatePicker}
                    />
                )}
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Categoria"
                    mode="flat"
                    dense={true}
                    editable={false}
                    value={assetCatName}
                    right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowCategoriaList(true) }} />}
                />
                {!showCamera &&
                    <Button icon="camera" mode="contained" onPress={prepareCamera}>
                        Agregar Foto
                    </Button>
                }

                {!showCamera && photoLocation &&
                    <View>
                        <View style={{ overflow: "hidden", padding: 10 }}>
                            <Image
                                style={{ height: 400, transform: [{ rotate: `${rotation}deg` }] }}
                                source={{ uri: photoLocation }}
                                resizeMode="contain" />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: "space-around", width: "100%" }}>
                            <Button icon="rotate-left" mode="contained-tonal" onPress={rotateLeft}>
                                Girar Izquierda
                            </Button>
                            <Button icon="rotate-right" mode="contained-tonal" onPress={rotateRight}>
                                Girar Derecha
                            </Button>
                        </View>
                    </View>
                }

            </ScrollView>
        </View>
    )
}