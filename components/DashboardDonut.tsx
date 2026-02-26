import React from 'react'
import DonutChart from './ChartSkia/DonutChart';
import { View, StyleSheet, Text } from "react-native"
import { useTheme } from "../app/ScppThemeContext"
import numeral from "numeral"
import "numeral/locales/es-es";
import { GetAppStyles } from "../styles/styles"

interface DashboardDonutProps {
    percentage: number;
    topGastos: any[];
    animationDelay?: number;
}

const DashboardDonut: React.FC<DashboardDonutProps> = ({ percentage, topGastos, animationDelay = 0 }) => {
    numeral.locale("es-es")
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    return (
        <View>
            <Text style={[appStyles.titleLarge, {marginBottom:10}]}>Uso del Presupuesto Mes</Text>
            <View style={styles.container}>
                <View style={{ flex: 0.4 }}>
                    <DonutChart percentage={percentage} label='Gastado' size={120} animationDelay={animationDelay} />
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