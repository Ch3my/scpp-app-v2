import React, { useMemo } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useTheme } from '../ScppThemeContext';
import { Stack } from "expo-router";
import { GetAppStyles } from "../../styles/styles"
import { useFoodItems, FoodItem } from '../../api/hooks';

const FoodList: React.FC = () => {
    const theme = useTheme();
    const appStyles = useMemo(() => GetAppStyles(theme), [theme]);
    const { data: foodItems = [], isLoading, refetch } = useFoodItems();

    const renderItem = ({ item }: { item: FoodItem }) => {
        const formattedDate = item.lastTransactionAt
            ? item.lastTransactionAt.toFormat("dd-MM-yyyy")
            : '';
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
                <Text style={[appStyles.textFontSize, { textAlign: 'right', flex: 0.5 }]}>{item.quantity}</Text>
                <Text style={[appStyles.textFontSize, { flex: 0.5 }]}>{item.unit}</Text>
                <Text style={[appStyles.textFontSize, { flex: 0.8 }]}>{formattedDate}</Text>
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
                <Text style={[appStyles.textFontSize, { textAlign: 'right', flex: 0.5 }]}>Cant</Text>
                <View style={{ flex: 0.5 }}></View>
                <Text style={[appStyles.textFontSize, { flex: 0.8 }]}>Actividad</Text>
            </View>
        )
    }

    return (
        <View>
            <Stack.Screen options={{ headerTitle: "Lista Food Storage" }} />
            <FlatList
                data={foodItems}
                ListHeaderComponent={tableHead}
                refreshing={isLoading}
                onRefresh={refetch}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

export default FoodList;
