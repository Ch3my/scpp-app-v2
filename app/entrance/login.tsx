import { View, KeyboardAvoidingView, StyleSheet, Image } from 'react-native'
import { useState, useContext } from 'react'
import { ScppContext } from "../ScppContext"
import { router, Stack } from 'expo-router';
import { AppButton } from '../../components/ui/AppButton';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { useTheme } from '../ScppThemeContext';
import { useLogin } from '../../api/hooks';

export default () => {
    const { updateSessionHash } = useContext(ScppContext);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const theme = useTheme();
    const loginMutation = useLogin();

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

    const login = async () => {
        loginMutation.mutate(
            { username, password },
            {
                onSuccess: async (data) => {
                    await updateSessionHash(data.sessionHash);
                    router.replace('/dashboard');
                },
                onError: (error) => {
                    console.log("Login error:", error);
                },
            }
        );
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
                        onPress={login}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
                    </AppButton>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}
