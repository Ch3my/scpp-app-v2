import Svg, { G, Circle, Path, Line, Polyline, Text, Rect } from "react-native-svg";
import {
    Image, Platform, StyleSheet, TouchableOpacity,
    View, Dimensions, ActivityIndicator
} from 'react-native';
import { useState } from "react";
import numeral from 'numeral'

const SVGPADDING = 80
const SVGPADDINGTOP = 30
const SVGPADDINGLEFT = 120
const BARCONTAINERHEIGHT = 40;
const BARHEIGHT = 30;


const BarChart = props => {
    // El alto total del Grafico sera el alto que nos pasaron menos un pedazo para
    // las etiquetas
    let chartHeight = props.labels.length * BARCONTAINERHEIGHT
    let chartWidth = props.totalWidth - 80

    let labelsY = buildLabelsY(props.yAxisPrefix, props.labels, props.dataset, props.totalWidth, props.labelsColor)
    let lines = buildLinesXY(chartWidth, chartHeight, props.labelsColor)
    let bars = buildBars(props.dataset, chartWidth)

    return (
        <View>
            <Svg height={chartHeight + SVGPADDING} width={props.totalWidth}>
                {lines}
                {labelsY}
                {bars}
            </Svg>
        </View>
    )


}
const buildLinesXY = (chartWidth, chartHeight, labelsColor) => {
    // La linea X siempre quedaba un poco corta. No descubri porque
    // pero quiza sea un error en las matematicas de xSeparation de los Paths
    // por ahora le sumamos una cola para que quede bien
    return (
        <Svg>
            <Line x1={SVGPADDINGLEFT} x2={chartWidth + 25} y={chartHeight + SVGPADDINGTOP} strokeWidth="1" stroke={labelsColor} />
            <Line y1={chartHeight + SVGPADDINGTOP} y2={0 + SVGPADDINGTOP} x={SVGPADDINGLEFT} strokeWidth="1" stroke={labelsColor} />
        </Svg>
    )
}

const buildLabelsY = (yAxisPrefix, labels, dataset, totalWidth, labelsColor) => {
    let labelsComp = []

    var xCordinate = 15
    for (let [index, l] of labels.entries()) {
        // +20 para que no empiece jsuto con la linea sino un poco mas abajo
        var yCordinate = (BARCONTAINERHEIGHT * index) + SVGPADDINGTOP + 20


        // Añadimos el punto mas alto
        labelsComp.push(
            <G key={index}>
                <Text x={xCordinate} y={yCordinate} textAnchor="start"
                    stroke={labelsColor} fontWeight="100">{l}</Text>
                <Text x={totalWidth - 15} y={yCordinate} textAnchor="end"
                    stroke={labelsColor} fontWeight="100">{yAxisPrefix + numeral(dataset[index]).format('0,0')}</Text>
            </G>
        )
    }

    return labelsComp
}

const buildBars = (dataset, chartWidth) => {
    var bars = []
    // Calculamos el alto maximo basado en el numero mas alto del dataset
    const maxBarWidth = chartWidth - SVGPADDINGLEFT
    var maxValueDataset = Math.max(...dataset)


    for (let [index, d] of dataset.entries()) {
        var heightRatio = d / maxValueDataset
        var barWidth = maxBarWidth * heightRatio
        var yCordinate = (BARCONTAINERHEIGHT * index) + SVGPADDINGTOP

        bars.push(
            <Rect x={SVGPADDINGLEFT} y={yCordinate} fill='#75c2be' width={barWidth}
                height={BARHEIGHT} key={index} />
        )
    }

    return bars

}

const styles = StyleSheet.create({

});

export default BarChart;