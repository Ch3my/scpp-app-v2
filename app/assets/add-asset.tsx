
import {
    StyleSheet, Text, TouchableOpacity,
    View, ScrollView, Image
} from 'react-native';
import { Link, Stack } from "expo-router";
import { useEffect, useState, useRef } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { GetAppStyles } from "../../styles/styles"
import { IconButton, MD3Colors, useTheme, Button } from 'react-native-paper';

export default () => {
    // TODO manejar permiso denegado, mostrar mensaje, etc
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    const [cameraPermission, setCameraPermission] = useState<string | null>(null);
    const [type, setType] = useState(CameraType.back);
    const [photoLocation, setPhotoLocation] = useState<string | undefined>(undefined);
    const cameraRef = useRef<Camera | null>(null)
    const [showCamera, setShowCamera] = useState<boolean>(false);

    useEffect(() => {
        const async = async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync()
            setCameraPermission(cameraStatus.status)
        }
        async()
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

    return (
        <ScrollView style={appStyles.container}>
            <Stack.Screen options={{ headerTitle: "Agregar Asset" }} />
            {!showCamera &&
                <Button icon="camera" mode="contained" onPress={() => setShowCamera(true)}>
                    Agregar Foto
                </Button>
            }
            <View style={appStyles.centerContentContainer}>
                {showCamera &&
                    <Camera style={appStyles.camera} type={type} ref={cameraRef} />
                }
                {showCamera &&
                    <View>
                        <Button icon="camera" mode="contained-tonal" style={{ marginBottom: 5 }} onPress={toggleCameraType}>
                            Flip Camara
                        </Button>
                        <Button icon="camera" mode="contained" onPress={takePicture}>
                            Tomar Foto
                        </Button>
                    </View>
                }
                {!showCamera &&
                    <Image
                        style={appStyles.camera}
                        source={{ uri: photoLocation }} />
                }
            </View>

        </ScrollView>
    )
}