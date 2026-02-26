import React, { useState, useContext, useCallback, useRef } from 'react';
import { useTheme } from '../ScppThemeContext';
import { ScrollView, Dimensions, InteractionManager, RefreshControl, View, Text } from 'react-native';
import { useFocusEffect, useNavigation } from "expo-router";
import axios, { CancelTokenSource } from 'axios';
import apiClient from '../../api/axiosClient';
import { ScppContext } from "../ScppContext";
import LineChart from '../../components/ChartSVG/LineChart';
import BarChart from '../../components/ChartSVG/BarChart';
import DashboardDonut from '../../components/DashboardDonut';
import { MonthlyGraphData } from '../../models/MonthlyGraphData';
import { ExpensesByCategoryData } from '../../models/ExpensesByCategoryData';
import { DateTime } from 'luxon';
import { GetAppStyles } from '../../styles/styles';

const Dashboard = () => {
    const theme = useTheme();
    const { } = useContext(ScppContext);
    const appStyles = GetAppStyles(theme)
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
        data: [],
        range: {
            start: '',
            end: ''
        }
    });
    const [donutData, setDonutData] = useState<{ percentage: number; topGastos: any[] }>({
        percentage: 0,
        topGastos: []
    });

    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

    const fetchData = useCallback(async () => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel('New request initiated');
        }
        cancelTokenSourceRef.current = axios.CancelToken.source();

        const startTime = performance.now();
        console.log('[Dashboard] API calls started');

        try {
            const [monthlyGraphResponse, expensesByCategoryResponse, donutResponse] = await Promise.all([
                apiClient.get<MonthlyGraphData>('/monthly-graph', {
                    params: { nMonths: 5 },
                    cancelToken: cancelTokenSourceRef.current.token
                }).then(res => {
                    console.log(`[Dashboard] /monthly-graph: ${(performance.now() - startTime).toFixed(0)}ms`);
                    return res;
                }),
                apiClient.get<ExpensesByCategoryData>('/expenses-by-category', {
                    params: { nMonths: 12 },
                    cancelToken: cancelTokenSourceRef.current.token
                }).then(res => {
                    console.log(`[Dashboard] /expenses-by-category: ${(performance.now() - startTime).toFixed(0)}ms`);
                    return res;
                }),
                apiClient.get<{ porcentajeUsado: number; topGastos: any[] }>('/curr-month-spending', {
                    cancelToken: cancelTokenSourceRef.current.token
                }).then(res => {
                    console.log(`[Dashboard] /curr-month-spending: ${(performance.now() - startTime).toFixed(0)}ms`);
                    return res;
                })
            ]);

            console.log(`[Dashboard] All APIs done: ${(performance.now() - startTime).toFixed(0)}ms`);
            setMonthlyGraphData(monthlyGraphResponse.data);
            setBarChartData(expensesByCategoryResponse.data);
            setDonutData({
                percentage: donutResponse.data.porcentajeUsado,
                topGastos: donutResponse.data.topGastos?.slice(0, 5) || []
            });
            console.log(`[Dashboard] State updated: ${(performance.now() - startTime).toFixed(0)}ms`);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error('Error fetching data:', error);
            }
        }
    }, []);

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
        }, [])
    );

    const screenWidth = Dimensions.get('window').width;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 15 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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