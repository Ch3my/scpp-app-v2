import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { Stack } from "expo-router";
import { ScppContext } from "../ScppContext"
import axios from 'axios';
import { DateTime } from 'luxon';
import { GetAppStyles } from "../../styles/styles"

const FoodList: React.FC = () => {
    const { sessionHash, apiPrefix } = useContext(ScppContext);
    const [foodItems, setFoodItems] = useState([]);
    const [apiCalling, setApiCalling] = useState<boolean>(true)
    const theme = useTheme();
    const appStyles = useMemo(() => GetAppStyles(theme), []);
    
    const getData = async () => {
        let response: any = {}
        try {
            response = await axios.get(
                apiPrefix + '/food/item-quantity',
                { params: {sessionHash} }
            )
        } catch (error) {
            console.log(error)
            return
        }
        if (response.status != 200) {
            console.log("Error al cargar la lista de alimentos")
            return
        }

        let processedItems = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            lastTransactionAt: item.last_transaction_at ? DateTime.fromISO(item.last_transaction_at) : null
        }));
        setFoodItems(processedItems)
        setApiCalling(false)
    }

    const renderItem = ({ item }: any) => {
        return (
            <View
                style={{
                    backgroundColor: theme.colors.background,
                    flexDirection: 'row',
                    padding: 10,
                    gap: 10,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.surfaceVariant,
                }}
            >
                <Text style={[appStyles.textFontSize, { flex: 1 }]}>{item.name}</Text>
                <Text style={[appStyles.textFontSize, { textAlign: 'right', flex: 1 }]}>{item.quantity}</Text>
                <Text style={[appStyles.textFontSize, { flex: 1 }]}>{item.unit}</Text>
                <Text style={[appStyles.textFontSize, { flex: 1 }]}>{item.lastTransactionAt}</Text>
            </View>
        );
    }

    const tableHead = () => {
        return (
            <View
                style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    flexDirection: 'row',
                    padding: 10,
                    alignItems: 'center',
                    gap: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.surfaceVariant,
                }}
            >
                <Text style={[appStyles.textFontSize, { flex: 1 }]}>Nombre</Text>
                <Text style={[appStyles.textFontSize, { textAlign: 'right', flex: 1 }]}>Cantidad</Text>
                <View style={{ flex: 1 }}></View>
                <Text style={[appStyles.textFontSize, { flex: 1 }]}>Actividad</Text>
            </View>
        )
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <View>
            <Stack.Screen options={{ headerTitle: "Lista Food Storage" }} />
            <FlatList
                data={foodItems}
                ListHeaderComponent={tableHead}
                refreshing={apiCalling}
                onRefresh={getData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

export default FoodList;