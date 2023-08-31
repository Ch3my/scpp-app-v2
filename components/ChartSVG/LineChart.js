import Svg, { G, Circle, Path, Line, Polyline, Text } from "react-native-svg";
import {
    Image, Platform, StyleSheet, TouchableOpacity,
    View, Dimensions, ActivityIndicator, Pressable
} from 'react-native';
import numeral from 'numeral'


const SVGPADDINGLEFT = 80
const SVGPADDINGTOP = 25
const YAXISDIVISIONS = 4

const LineChart = props => {
    // El alto total del Grafico sera el alto que nos pasaron menos un pedazo para
    // las etiquetas
    let chartHeight = props.totalHeight - 80
    let chartWidth = props.totalWidth - 80

    // SVG 0,0 es la esq sup izq
    // totalHeight<Integer>, totalWidth<Integer>, dataset<Obj Arr>, labels<String Array>
    // datasets: [{data:[], color: String }]

    // Buscar el higherPoint mas alto de dataset
    // y pasar ese para a la funcion que crea los dataset, asi todos usan el mismo ratio
    let higherPoint = 0
    for (let d of props.datasets) {
        let datasetHigherPoint = Math.max(...d.data)
        if (higherPoint < datasetHigherPoint) {
            higherPoint = datasetHigherPoint
        }
    }

    let paths = []
    let dots = []
    for (let [index, d] of props.datasets.entries()) {
        paths.push(
            buildPath(chartHeight, chartWidth, d, index, higherPoint)
        )
        dots.push(buildDatasetChartPoint(chartHeight, chartWidth, d, index, higherPoint))
    }

    let labelsX = buildLabelsX(chartWidth, chartHeight, props.labels, props.labelsColor)
    let labelsY = buildLabelsY(chartHeight, higherPoint, props.yAxisPrefix, props.labelsColor)
    let lines = buildLinesXY(chartWidth, chartHeight, props.labelsColor)

    return (
        <View>
            <Svg height={props.totalHeight} width={props.totalWidth}>
                {lines}
                {paths}
                {labelsX}
                {labelsY}
                {dots}
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

const buildLabelsX = (chartWidth, chartHeight, labels, labelsColor) => {
    let xSeparation = Math.floor(chartWidth / labels.length)
    let yCordinate = (chartHeight + SVGPADDINGTOP) + 25

    let labelsComp = []
    for (let [index, l] of labels.entries()) {
        let xCordinate = SVGPADDINGLEFT + (xSeparation * index)

        labelsComp.push(
            <Text key={index} x={xCordinate} y={yCordinate}
                stroke={labelsColor} fontWeight="100" textAnchor="middle"
                rotation={-30} originX={xCordinate} originY={yCordinate}>{l}</Text>
        )
    }
    return labelsComp
}

const buildLabelsY = (chartHeight, higherPoint, yAxisPrefix, labelsColor) => {
    let labelsComp = []
    let step = higherPoint / YAXISDIVISIONS
    var labelValues = []
    let xCordinate = SVGPADDINGLEFT - 5
    let ySeparation = Math.floor(chartHeight / YAXISDIVISIONS)

    for (let i = 0; i < YAXISDIVISIONS; i++) {
        labelValues.push(Math.round(step * i))
    }

    for (let [index, l] of labelValues.entries()) {
        let yCordinate
        if (index == 0) {
            yCordinate = chartHeight + SVGPADDINGTOP
        } else {
            yCordinate = (chartHeight + SVGPADDINGTOP) - ySeparation * index
        }

        labelsComp.push(
            <Text x={xCordinate} y={yCordinate} textAnchor="end" key={index}
                stroke={labelsColor} fontWeight="100">{yAxisPrefix + numeral(l).format('0,0')}</Text>
        )
    }

    // Añadimos el punto mas alto
    labelsComp.push(
        <Text key={YAXISDIVISIONS + 1} x={xCordinate} y={(chartHeight + SVGPADDINGTOP) - ySeparation * YAXISDIVISIONS + 1} textAnchor="end"
            stroke={labelsColor} fontWeight="100">{yAxisPrefix + numeral(higherPoint).format('0,0')}</Text>
    )

    return labelsComp
}

const buildPath = (totalHeight, totalWidth, dataset, index, higherPoint) => {
    // dataset {data:[], color: Function }
    let d = buildPathD(totalHeight, totalWidth, dataset.data, higherPoint)
    return (
        <Path
            d={d}
            fill="none"
            stroke={dataset.color}
            strokeWidth="2"
            key={index}
        />
    )
}

const buildDatasetChartPoint = (chartHeight, chartWidth, dataset, index, higherPoint) => {
    let pointCoordinates = buildPointsCordinates(chartHeight, chartWidth, dataset.data, higherPoint)
    let dots = []

    for (let [sec, p] of pointCoordinates.entries()) {
        dots.push(
                <Circle
                    key={index + '-' + sec}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={dataset.color}
                />
        )
    }
    return dots
}

const buildPointsCordinates = (chartHeight, chartWidth, dataset, higherPoint) => {
    // Para calcular cada X simplemente tomaremos el totalWidth y lo dividiremos por
    // dataset.length asi cada uno quedara a la misma separacion

    let xSeparation = Math.floor(chartWidth / dataset.length)
    // pointCoordinates es un array de Objetos [{x:Integer, y:Integer}]
    let pointCoordinates = []

    // Encontrar el punto mas alto del dataset para crear ratio con el tamaño del grafico
    // var higherPoint = Math.max(...dataset)
    var yRatio = higherPoint / chartHeight

    // Hacemos loop y marcamos cada punto
    // Como 0.0 es arriba tenemos que cambiar la orientacion de Y
    // como si 0.0 fuera abajo
    for (let [index, p] of dataset.entries()) {
        pointCoordinates.push({
            x: (index * xSeparation) + SVGPADDINGLEFT,
            y: (chartHeight - (p / yRatio)) + SVGPADDINGTOP
        })
    }

    return pointCoordinates
}

const buildPathD = (totalHeight, totalWidth, dataset, higherPoint) => {
    let pointCoordinates = buildPointsCordinates(totalHeight, totalWidth, dataset, higherPoint)

    // Construimos d de un dataset
    let d = ``

    for (let [index, p] of pointCoordinates.entries()) {
        if (index == 0) {
            // Primer punto setea la posicion del puntero
            d += `M${p.x} ${p.y} `
        } else {
            // Todos los demas van dibujando
            d += `L${p.x} ${p.y} `
        }
    }
    return d
}

const styles = StyleSheet.create({

});

export default LineChart;