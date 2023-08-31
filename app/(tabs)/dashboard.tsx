import {
    useTheme, Text, Appbar,
    Modal, Portal, IconButton
} from 'react-native-paper';
import {
    StyleSheet, View, ScrollView, Dimensions,
    InteractionManager
} from 'react-native';
import { Link, useNavigation, Redirect, Stack, router, useFocusEffect } from "expo-router";
import { GetAppStyles } from "../../styles/styles"

import LineChart from '../../components/ChartSVG/LineChart'
import BarChart from '../../components/ChartSVG/BarChart';
import axios, { AxiosResponse } from 'axios'
import { ScppContext } from "../ScppContext"
import numeral from 'numeral'
import { useState, useContext, useCallback } from 'react';

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix } = useContext(ScppContext);

    const [monthlyGraphData, setMonthlyGraphData] = useState<MonthlyGraphData>();
    const [barChartData, setBarChartData] = useState<ExpensesByCategoryData>();

    const getMonthlyGraph = async () => {
        const response: AxiosResponse<any> = await axios.get(apiPrefix + '/monthly-graph', {
            params: {
                sessionHash,
                nMonths: 5
            }
        });
        if (response.data) {
            setMonthlyGraphData(response.data)
        }
    };

    const getExpensesByCategory = async () => {
        const response: AxiosResponse<any> = await axios.get(apiPrefix + '/expenses-by-category', {
            params: {
                sessionHash,
                nMonths: 5
            }
        });
        if (response.data) {
            setBarChartData(response.data)
        }
    };
    useFocusEffect(
        useCallback(() => {
            const task = InteractionManager.runAfterInteractions(() => {
                getMonthlyGraph()
                getExpensesByCategory()
            })
            return () => task.cancel();
        }, [useNavigation().isFocused()])
    );

    return (
        <ScrollView style={{flex:1, backgroundColor: theme.colors.background,}}>
            {monthlyGraphData &&
                <LineChart datasets={[{
                    data: monthlyGraphData.gastosDataset,
                    color: 'rgba(255, 99, 132, 1)'
                }, {
                    data: monthlyGraphData.ingresosDataset,
                    color: 'rgba(4, 162, 235, 1)'
                }, {
                    data: monthlyGraphData.ahorrosDataset,
                    color: 'rgba(255, 205, 86, 1)'
                }]}
                    totalWidth={Dimensions.get('window').width}
                    totalHeight="250"
                    labels={monthlyGraphData.labels}
                    labelsColor={theme.colors.onBackground}
                    yAxisPrefix='$ ' />
            }
            {barChartData &&
                <BarChart dataset={barChartData.amounts}
                    totalWidth={Dimensions.get('window').width}
                    labels={barChartData.labels}
                    labelsColor={theme.colors.onBackground}
                    yAxisPrefix='$ ' />
            }

        </ScrollView>
    )
}