import {
    StyleSheet, Text, TouchableOpacity,
    View, ScrollView, Image, FlatList
} from 'react-native';
import { Link, Stack } from "expo-router";
import { useEffect, useState, useRef, useContext } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { GetAppStyles } from "../../styles/styles"
import {
    IconButton, MD3Colors, useTheme, Button, TextInput,
    Portal, Dialog, List, Snackbar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from "luxon";
import axios, { AxiosResponse } from 'axios'
import { ScppProvider, ScppContext } from "../ScppContext"
import { ConvertToBase64 } from "../../helpers/base64-file-enconder"
import { CompressAndResizeImage } from "../../helpers/img-compressor"

export default () => {
    // TODO manejar permiso denegado, mostrar mensaje, etc
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix, isReady } = useContext(ScppContext);

    const [cameraPermission, setCameraPermission] = useState<string | null>(null);
    const [type, setType] = useState(CameraType.back);
    const [photoLocation, setPhotoLocation] = useState<string | undefined>(undefined);
    const cameraRef = useRef<Camera | null>(null)
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showCategoriaList, setShowCategoriaList] = useState<boolean>(false);
    const [showSnackBar, setShowSnackBar] = useState<boolean>(false);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");

    let [assetDescription, setAssetDescription] = useState<string>("")
    let [assetDate, setAssetDate] = useState<Date>(new Date())
    let [assetCatId, setAssetCatId] = useState<number>(0)
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
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setPhotoLocation(photo.uri)
                setShowCamera(false)
            } catch (error) {
                console.log(error)
            }
        }
    }
    const onChangeDatePicker = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setAssetDate(selectedDate)
        }
    }
    const onUpdateCategoria = ({ id, descripcion }: { id: number, descripcion: string }) => {
        setAssetCatId(id)
        setAssetCatName(descripcion)
        setShowCategoriaList(false)
    }
    const saveAsset = async () => {
        if (!photoLocation) {
            return
        }
        let compressImgUri = await CompressAndResizeImage(photoLocation)
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

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerTitle: "Agregar Asset" }} />
            <Snackbar
                visible={showSnackBar}
                style={{ zIndex: 999 }}
                onDismiss={() => { setShowSnackBar(false) }}>
                {snackbarMsg}
            </Snackbar>
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
            <View style={[appStyles.btnRow, { backgroundColor: theme.colors.background, padding: 10 }]}>
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
                    mode="outlined"
                    value={assetDescription}
                    autoCapitalize="none"
                    onChangeText={text => setAssetDescription(text)} />
                <TextInput
                    style={{ marginBottom: 5 }}
                    label="Fecha"
                    mode="outlined"
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
                    mode="outlined"
                    editable={false}
                    value={assetCatName}
                    right={<TextInput.Icon icon="chevron-down" onPress={() => { setShowCategoriaList(true) }} />}
                />

                {!showCamera &&
                    <Button icon="camera" mode="contained" onPress={() => setShowCamera(true)}>
                        Agregar Foto
                    </Button>
                }
                <View style={appStyles.centerContentContainer}>
                    {showCamera &&
                        <Camera style={appStyles.camera} type={type} ref={cameraRef} />
                    }
                    {!showCamera &&
                        <Image
                            style={appStyles.camera}
                            source={{ uri: photoLocation }} />
                    }
                </View>
                {showCamera &&
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <Button icon="camera" mode="contained-tonal" onPress={toggleCameraType}>
                            Flip Camara
                        </Button>
                        <Button icon="camera" mode="contained" onPress={takePicture}>
                            Tomar Foto
                        </Button>
                    </View>
                }
            </ScrollView>
        </View>
    )
}