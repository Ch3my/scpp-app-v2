import React from 'react';
import { useTheme } from '../ScppThemeContext';
import { ScrollView, Dimensions, RefreshControl, View, Text } from 'react-native';
import LineChart from '../../components/ChartSVG/LineChart';
import BarChart from '../../components/ChartSVG/BarChart';
import DashboardDonut from '../../components/DashboardDonut';
import { DateTime } from 'luxon';
import { GetAppStyles } from '../../styles/styles';
import { useDashboardQueries } from '../../api/hooks';

const Dashboard = () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    const {
        monthlyGraph,
        expensesByCategory,
        currMonthSpending,
        isRefetching,
        refetch,
    } = useDashboardQueries();

    const onRefresh = async () => {
        await refetch();
    };

    const monthlyGraphData = monthlyGraph ?? {
        labels: [],
        gastosDataset: [],
        ingresosDataset: [],
        ahorrosDataset: []
    };

    const barChartData = expensesByCategory ?? {
        labels: [],
        amounts: [],
        data: [],
        range: { start: '', end: '' }
    };

    const donutData = {
        percentage: currMonthSpending?.porcentajeUsado ?? 0,
        topGastos: currMonthSpending?.topGastos?.slice(0, 5) ?? []
    };

    const screenWidth = Dimensions.get('window').width;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 15 }}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
            }
        >
            <Text style={appStyles.titleLarge}>Histórico Financiero Mensual</Text>
            <LineChart
                datasets={[
                    { data: monthlyGraphData.gastosDataset, color: 'rgba(255, 99, 132, 1)' },
                    { data: monthlyGraphData.ingresosDataset, color: 'rgba(4, 162, 235, 1)' },
                    { data: monthlyGraphData.ahorrosDataset, color: 'rgba(255, 205, 86, 1)' }
                ]}
                totalWidth={screenWidth}
                totalHeight={250}
                labels={monthlyGraphData.labels}
                labelsColor={theme.colors.onBackground}
                yAxisPrefix='$ '
                animationDelay={0}
            />
            <View style={{ marginTop: 10, marginBottom: 20 }}>
                <DashboardDonut percentage={donutData.percentage} topGastos={donutData.topGastos} animationDelay={150} />
            </View>
            <View style={{ marginBottom: 30 }}>
                <Text style={appStyles.titleLarge}>Resumen Categoría</Text>
                <Text style={{ marginBottom: 10, color: theme.colors.onBackground }}>
                    {barChartData.range.start !== "" && barChartData.range.end !== "" && (
                        <Text style={appStyles.textFontSize}>
                            {DateTime.fromISO(barChartData.range.start).toLocaleString({ month: 'long', year: 'numeric' })} -
                            {DateTime.fromISO(barChartData.range.end).toLocaleString({ month: 'long', year: 'numeric' })}
                        </Text>
                    )}
                </Text>
                <BarChart
                    dataset={barChartData.amounts}
                    labels={barChartData.labels}
                    labelsColor={theme.colors.onBackground}
                    yAxisPrefix='$ '
                    animationDelay={300}
                />
            </View>
        </ScrollView>
    );
};

export default Dashboard;
