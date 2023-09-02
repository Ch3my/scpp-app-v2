import { ScrollView, View, KeyboardAvoidingView, StyleSheet } from 'react-native'
import { useState, useContext } from 'react'
import { Button, Card, TextInput } from 'react-native-paper';
import axios from 'axios'
import { ScppContext } from "../ScppContext"
import { router, Stack } from 'expo-router';

export default () => {
    const { sessionHash, apiPrefix, updateSessionHash } = useContext(ScppContext);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const styles = StyleSheet.create({
        card: {
            width: 350,
        },
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
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
            <Card style={styles.card}>
                <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
                <Card.Content>
                    <TextInput label='Nombre de Usuario'
                        mode="flat"
                        value={username}
                        autoCapitalize="none"
                        onChangeText={text => setUsername(text)} />
                    <TextInput label='Contraseña'
                        mode="flat"
                        autoCapitalize="none"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={text => setPassword(text)} />
                </Card.Content>
                <Card.Actions>
                    <Button mode="contained" style={styles.loginButton} onPress={async () => await login(username, password)}>Ingresar</Button>
                </Card.Actions>
            </Card>
        </KeyboardAvoidingView>
    )
}