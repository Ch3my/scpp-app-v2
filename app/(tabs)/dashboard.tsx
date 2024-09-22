import React, { useState, useContext, useCallback, useRef } from 'react';
import { useTheme, Text } from 'react-native-paper';
import { ScrollView, Dimensions, InteractionManager, RefreshControl, View } from 'react-native';
import { useFocusEffect } from "expo-router";
import axios, { CancelTokenSource } from 'axios';
import { ScppContext } from "../ScppContext";
import LineChart from '../../components/ChartSVG/LineChart';
import BarChart from '../../components/ChartSVG/BarChart';
import DashboardDonut from '../../components/DashboardDonut';

const Dashboard = () => {
    const theme = useTheme();
    const { sessionHash, apiPrefix } = useContext(ScppContext);
    const [refreshing, setRefreshing] = useState(false);
    const [monthlyGraphData, setMonthlyGraphData] = useState<MonthlyGraphData>({
        labels: [],
        gastosDataset: [],
        ingresosDataset: [],
        ahorrosDataset: []
    });
    const [barChartData, setBarChartData] = useState<ExpensesByCategoryData>({
        labels: [],
        amounts: [],
        data: []
    });

    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

    const fetchData = useCallback(async () => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel('New request initiated');
        }
        cancelTokenSourceRef.current = axios.CancelToken.source();

        try {
            const [monthlyGraphResponse, expensesByCategoryResponse] = await Promise.all([
                axios.get<MonthlyGraphData>(`${apiPrefix}/monthly-graph`, {
                    params: { sessionHash, nMonths: 5 },
                    cancelToken: cancelTokenSourceRef.current.token
                }),
                axios.get<ExpensesByCategoryData>(`${apiPrefix}/expenses-by-category`, {
                    params: { sessionHash, nMonths: 5 },
                    cancelToken: cancelTokenSourceRef.current.token
                })
            ]);

            setMonthlyGraphData(monthlyGraphResponse.data);
            setBarChartData(expensesByCategoryResponse.data);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error('Error fetching data:', error);
            }
        }
    }, [apiPrefix, sessionHash]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    useFocusEffect(
        useCallback(() => {
            const task = InteractionManager.runAfterInteractions(fetchData);
            return () => {
                task.cancel();
                if (cancelTokenSourceRef.current) {
                    cancelTokenSourceRef.current.cancel('Component unmounted');
                }
            };
        }, [fetchData])
    );

    const screenWidth = Dimensions.get('window').width;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 15 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text variant="titleLarge">Hístorico Financiero Mensual</Text>
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
            />
            <View style={{ marginVertical: 10 }}>
                <DashboardDonut shouldRefresh={refreshing} />
            </View>
            <View style={{ marginBottom: 30 }}>
                <Text variant="titleLarge" style={{ marginBottom: 10 }}>Resumen Categoría 12 Meses</Text>
                <BarChart
                    dataset={barChartData.amounts}
                    totalWidth={screenWidth}
                    labels={barChartData.labels}
                    labelsColor={theme.colors.onBackground}
                    yAxisPrefix='$ '
                />
            </View>
        </ScrollView>
    );
};

export default Dashboard;