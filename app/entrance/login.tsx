import { View, KeyboardAvoidingView, StyleSheet, Image } from 'react-native'
import { useState, useContext } from 'react'
import axios from 'axios'
import { ScppContext } from "../ScppContext"
import { router, Stack } from 'expo-router';
import { AppButton } from '../../components/ui/AppButton';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { useTheme } from '../ScppThemeContext';

export default () => {
    const { sessionHash, apiPrefix, updateSessionHash } = useContext(ScppContext);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const theme = useTheme();

    const styles = StyleSheet.create({
        card: {
            width: 350,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            overflow: 'hidden',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        cardCover: {
            width: '100%',
            height: 200,
        },
        cardContent: {
            padding: 16,
        },
        cardActions: {
            padding: 16,
            paddingTop: 0,
        },
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.background,
        },
        loginButton: {
            flex: 1
        }
    })

    const login = async (username: string, password: string) => {
        let response: any = {}
        try {
            response = await axios.post(
                apiPrefix + '/login',
                { username, password }
            )
        } catch (error) {
            console.log(error)
            return
        }
        if (response.status != 200) {
            console.log("El usuario no esta autorizado")
            return
        }
        await updateSessionHash(response.data.sessionHash)
        router.replace('/dashboard');
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Stack.Screen options={{ headerTitle: "SCPP" }} />
            <View style={styles.card}>
                <Image
                    source={{ uri: 'https://picsum.photos/700' }}
                    style={styles.cardCover}
                />
                <View style={styles.cardContent}>
                    <AppTextInput
                        label='Nombre de Usuario'
                        mode="flat"
                        value={username}
                        autoCapitalize="none"
                        onChangeText={text => setUsername(text)}
                    />
                    <AppTextInput
                        label='Contraseña'
                        mode="flat"
                        autoCapitalize="none"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={text => setPassword(text)}
                    />
                </View>
                <View style={styles.cardActions}>
                    <AppButton
                        mode="contained"
                        style={styles.loginButton}
                        onPress={async () => await login(username, password)}
                    >
                        Ingresar
                    </AppButton>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}
