import { ScrollView, View, Animated } from "react-native"
import { Link, useNavigation, Redirect, Stack, router } from "expo-router";
import { IconButton, useTheme, DataTable, Text } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"
import { useEffect, useState, useRef, useContext } from 'react';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import { ScppThemeContext } from '../ScppThemeContext';

// https://software-mansion.github.io/react-native-gesture-handler/docs/component-swipeable.html
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { paperTheme } = useContext(ScppThemeContext);
    const { sessionHash, apiPrefix } = useContext(ScppContext);
    const [assetList, setAssetList] = useState<Asset[]>([])

    const getData = async () => {
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
    }

    useEffect(() => {
        getData()
    }, [])

    const rightSwipe = (progress: any, dragX: any, id: number) => {
        // outputRange: [100, 1] contiene el largo del item
        const translateEdit = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 1],
            extrapolate: 'clamp',
        });
        const translateDelete = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 1],
            extrapolate: 'clamp',
        });
        const editAction = () => {
            router.push("/assets/edit/" + id)
        }
        return (
            <View style={{ flexDirection: 'row', width: 100 }}>
                <Animated.View style={{
                    backgroundColor: theme.colors.error,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateX: translateDelete }]
                }}>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="delete"
                        iconColor={theme.colors.onError}
                    />
                </Animated.View>
                <Animated.View style={{
                    backgroundColor: theme.colors.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateX: translateEdit }]
                }}>
                    <IconButton
                        icon="file-edit"
                        iconColor={theme.colors.onSecondary}
                        onPress={()=> {editAction()}}
                    />
                </Animated.View>
            </View>
        )
    }

    return (
        <ScrollView style={appStyles.container}>
            <Stack.Screen options={{ headerTitle: "Assets" }} />
            <View style={appStyles.btnRow}>
                <Link href="/assets/add-asset" asChild>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="plus"
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                    />
                </Link>
                <IconButton
                    style={appStyles.btnRowBtn}
                    icon="refresh"
                    mode="contained-tonal"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={() => { getData() }}
                />
            </View>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={{ flex: 0.5 }}>Fecha</DataTable.Title>
                    <DataTable.Title >Descripcion</DataTable.Title>
                </DataTable.Header>
                {assetList.map((item) => (
                    <Swipeable
                        renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
                        key={item.id}
                        friction={1}>
                        <DataTable.Row>
                            <DataTable.Cell style={{ flex: 0.5 }}>{item.fecha}</DataTable.Cell>
                            <DataTable.Cell>{item.descripcion}</DataTable.Cell>
                        </DataTable.Row>
                    </Swipeable>
                ))}
            </DataTable>
        </ScrollView>
    )
}