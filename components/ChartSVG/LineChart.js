import React, { useEffect } from 'react';
import Svg, { G, Circle, Path, Line, Polyline, Text } from "react-native-svg";
import {
    View, StyleSheet
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import numeral from 'numeral';

const SVGPADDINGLEFT = 80;
const SVGPADDINGTOP = 25;
const YAXISDIVISIONS = 4;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const LineChart = props => {
    let chartHeight = props.totalHeight - 80;
    let chartWidth = props.totalWidth - 80;

    let higherPoint = Math.max(0, ...props.datasets.flatMap(d => d.data));

    let paths = buildPaths(chartHeight, chartWidth, props.datasets, higherPoint);
    let dots = buildDots(chartHeight, chartWidth, props.datasets, higherPoint);

    let labelsX = buildLabelsX(chartWidth, chartHeight, props.labels, props.labelsColor);
    let labelsY = buildLabelsY(chartHeight, higherPoint, props.yAxisPrefix, props.labelsColor);
    let lines = buildLinesXY(chartWidth, chartHeight, props.labelsColor);

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
    );
};

const buildLinesXY = (chartWidth, chartHeight, labelsColor) => {
    return (
        <Svg>
            <Line x1={SVGPADDINGLEFT} x2={chartWidth + 25} y={chartHeight + SVGPADDINGTOP} strokeWidth="1" stroke={labelsColor} />
            <Line y1={chartHeight + SVGPADDINGTOP} y2={0 + SVGPADDINGTOP} x={SVGPADDINGLEFT} strokeWidth="1" stroke={labelsColor} />
        </Svg>
    );
};

const buildLabelsX = (chartWidth, chartHeight, labels = [], labelsColor) => {
    // Ensure xSeparation is safe even if labels array is empty
    let xSeparation = labels.length > 0 ? Math.floor(chartWidth / labels.length) : chartWidth;
    let yCordinate = (chartHeight + SVGPADDINGTOP) + 25;

    // If labels is undefined or empty, this will return an empty array
    return labels.map((l, index) => {
        let xCordinate = SVGPADDINGLEFT + (xSeparation * index);
        return (
            <Text key={index} x={xCordinate} y={yCordinate}
                stroke={labelsColor} fontWeight="100" textAnchor="middle"
                rotation={-30} originX={xCordinate} originY={yCordinate}>
                {l}
            </Text>
        );
    });
};


const buildLabelsY = (chartHeight, higherPoint, yAxisPrefix, labelsColor) => {
    let step = higherPoint / YAXISDIVISIONS;
    let labelValues = Array.from({length: YAXISDIVISIONS}, (_, i) => Math.round(step * i));
    let xCordinate = SVGPADDINGLEFT - 5;
    let ySeparation = Math.floor(chartHeight / YAXISDIVISIONS);

    let labels = labelValues.map((l, index) => {
        let yCordinate = index === 0 ? chartHeight + SVGPADDINGTOP : (chartHeight + SVGPADDINGTOP) - ySeparation * index;
        return (
            <Text x={xCordinate} y={yCordinate} textAnchor="end" key={index}
                stroke={labelsColor} fontWeight="100">{yAxisPrefix + numeral(l).format('0,0')}</Text>
        );
    });

    labels.push(
        <Text key={YAXISDIVISIONS + 1} x={xCordinate} y={(chartHeight + SVGPADDINGTOP) - ySeparation * YAXISDIVISIONS + 1} textAnchor="end"
            stroke={labelsColor} fontWeight="100">{yAxisPrefix + numeral(higherPoint).format('0,0')}</Text>
    );

    return labels;
};

const AnimatedLine = ({ d, color }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: 1000 - (progress.value * 1000),
    }));

    return (
        <AnimatedPath
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={1000}
            animatedProps={animatedProps}
        />
    );
};

const buildPaths = (totalHeight, totalWidth, datasets, higherPoint) => {
    return datasets.map((dataset, index) => {
        let d = buildPathD(totalHeight, totalWidth, dataset.data, higherPoint);
        return (
            <AnimatedLine key={index} d={d} color={dataset.color} />
        );
    });
};

const AnimatedDot = ({ cx, cy, r, fill }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        r: r * scale.value,
    }));

    return (
        <AnimatedCircle
            cx={cx}
            cy={cy}
            fill={fill}
            animatedProps={animatedProps}
        />
    );
};

const buildDots = (chartHeight, chartWidth, datasets, higherPoint) => {
    return datasets.flatMap((dataset, datasetIndex) => {
        let pointCoordinates = buildPointsCordinates(chartHeight, chartWidth, dataset.data, higherPoint);
        return pointCoordinates.map((p, pointIndex) => (
            <AnimatedDot
                key={`${datasetIndex}-${pointIndex}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={dataset.color}
            />
        ));
    });
};

const buildPointsCordinates = (chartHeight, chartWidth, dataset = [], higherPoint) => {
    // Ensure xSeparation defaults to 0 if dataset is empty
    let xSeparation = dataset.length > 0 ? Math.floor(chartWidth / dataset.length) : 0;
    let yRatio = higherPoint / chartHeight;

    // If dataset is empty or undefined, this will return an empty array
    return dataset.map((p, index) => ({
        x: (index * xSeparation) + SVGPADDINGLEFT,
        y: (chartHeight - (p / yRatio)) + SVGPADDINGTOP
    }));
};


const buildPathD = (totalHeight, totalWidth, dataset, higherPoint) => {
    let pointCoordinates = buildPointsCordinates(totalHeight, totalWidth, dataset, higherPoint);
    return pointCoordinates.reduce((d, p, index) => 
        index === 0 ? `M${p.x} ${p.y}` : `${d} L${p.x} ${p.y}`, 
    '');
};

const styles = StyleSheet.create({});

export default LineChart;