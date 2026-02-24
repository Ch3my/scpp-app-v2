import { useState, useContext, useCallback, useEffect } from 'react'
import DonutChart from './ChartSVG/DonutChart';
import { ScppContext } from '../app/ScppContext';
import { AxiosResponse } from 'axios'
import apiClient from '../api/axiosClient';
import { useNavigation, useFocusEffect } from "expo-router";
import { InteractionManager, View, StyleSheet, FlatList, Text } from "react-native"
import { useTheme } from "../app/ScppThemeContext"
import numeral from "numeral"
import "numeral/locales/es-es";
import { GetAppStyles } from "../styles/styles"

interface DashboardDonutProps {
    shouldRefresh: boolean;
}

const DashboardDonut: React.FC<DashboardDonutProps> = ({ shouldRefresh }) => {
    numeral.locale("es-es")
    const { } = useContext(ScppContext);
    const [percentage, setPercentage] = useState<number>(0);
    const [topGastos, setTopGastos] = useState<any[]>([]);
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    const getData = async () => {
        const response: AxiosResponse<any> = await apiClient.get('/curr-month-spending');
        if (response.data) {
            setPercentage(response.data.porcentajeUsado)
            if (response.data.topGastos) {
                setTopGastos(response.data.topGastos.slice(0, 5) || [])
            }
        }
    };

    useEffect(() => {
        if (shouldRefresh) {
            getData()
        }
    }, [shouldRefresh])

    useFocusEffect(
        useCallback(() => {
            const task = InteractionManager.runAfterInteractions(() => {
                getData()
            })
            return () => task.cancel();
        }, [useNavigation().isFocused()])
    );

    return (
        <View>
            <Text style={[appStyles.titleLarge, {marginBottom:10}]}>Uso del Presupuesto Mes</Text>
            <View style={styles.container}>
                <View style={{ flex: 0.4 }}>
                    <DonutChart percentage={percentage} label='Gastado' size={120}></DonutChart>
                </View>
                <View style={{ flex: 0.6 }}>
                    {topGastos.map((item, index) => (
                        <View key={index} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={appStyles.textFontSize}>{item.proposito.slice(0, 14)}</Text>
                            <Text style={appStyles.textFontSize}>$ {numeral(item.monto).format("0,0")}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

// Styles for the two-column layout
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // Arrange children in a row
        justifyContent: 'space-between', // Distribute the columns with space between them
        gap: 20,
    }
});

export default DashboardDonut;