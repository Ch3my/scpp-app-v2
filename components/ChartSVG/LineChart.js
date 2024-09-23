import React, { useEffect, useMemo } from 'react';
import Svg, { G, Circle, Path, Line, Text } from "react-native-svg";
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import numeral from 'numeral';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PADDING = {
    LEFT: 80,
    RIGHT: 40, // Increased right padding to prevent cutoff
    TOP: 25,
    BOTTOM: 55
};
const Y_AXIS_DIVISIONS = 4;
const ANIMATION_DURATION = 1000;
const DOT_RADIUS = 4;
const STROKE_WIDTH = 1;
const STROKE_WIDTH_LINE = 2;
const X_LABEL_OFFSET = 10; // New constant for x-label offset

const LineChart = ({ totalHeight, totalWidth, datasets, labels, labelsColor, yAxisPrefix }) => {
    const chartHeight = totalHeight - PADDING.TOP - PADDING.BOTTOM;
    const chartWidth = totalWidth - PADDING.LEFT - PADDING.RIGHT;
    const higherPoint = Math.max(0, ...datasets.flatMap(d => d.data));

    const memoizedComponents = useMemo(() => {
        const paths = buildPaths(chartHeight, chartWidth, datasets, higherPoint);
        const dots = buildDots(chartHeight, chartWidth, datasets, higherPoint);
        const labelsX = buildLabelsX(chartWidth, chartHeight, labels, labelsColor);
        const labelsY = buildLabelsY(chartHeight, higherPoint, yAxisPrefix, labelsColor);
        const lines = buildLinesXY(chartWidth, chartHeight, labelsColor);
        return { paths, dots, labelsX, labelsY, lines };
    }, [chartHeight, chartWidth, datasets, higherPoint, labels, labelsColor, yAxisPrefix]);

    return (
        <View>
            <Svg height={totalHeight} width={totalWidth}>
                {memoizedComponents.lines}
                {memoizedComponents.paths}
                {memoizedComponents.labelsX}
                {memoizedComponents.labelsY}
                {memoizedComponents.dots}
            </Svg>
        </View>
    );
};

const buildLinesXY = (chartWidth, chartHeight, labelsColor) => (
    <G>
        <Line x1={PADDING.LEFT} x2={chartWidth + PADDING.LEFT} y1={chartHeight + PADDING.TOP} y2={chartHeight + PADDING.TOP} strokeWidth={STROKE_WIDTH} stroke={labelsColor} />
        <Line x1={PADDING.LEFT} x2={PADDING.LEFT} y1={chartHeight + PADDING.TOP} y2={PADDING.TOP} strokeWidth={STROKE_WIDTH} stroke={labelsColor} />
    </G>
);

const buildLabelsX = (chartWidth, chartHeight, labels = [], labelsColor) => {
    const xSeparation = labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;
    const yCordinate = chartHeight + PADDING.TOP + 30;

    return labels.map((label, index) => {
        const xCordinate = PADDING.LEFT + (xSeparation * index) - X_LABEL_OFFSET; // Subtract X_LABEL_OFFSET here
        return (
            <Text
                key={index}
                x={xCordinate}
                y={yCordinate}
                fill={labelsColor}
                fontWeight="400"
                textAnchor="middle"
                fontSize={14}
                rotation={-30}
                originX={xCordinate}
                originY={yCordinate}
            >
                {label}
            </Text>
        );
    });
};

const buildLabelsY = (chartHeight, higherPoint, yAxisPrefix, labelsColor) => {
    const step = higherPoint / Y_AXIS_DIVISIONS;
    const labelValues = Array.from({ length: Y_AXIS_DIVISIONS + 1 }, (_, i) => Math.round(step * i));
    const xCordinate = PADDING.LEFT - 7;
    const ySeparation = chartHeight / Y_AXIS_DIVISIONS;

    return labelValues.map((value, index) => {
        const yCordinate = chartHeight + PADDING.TOP - ySeparation * index;
        return (
            <Text
                key={index}
                x={xCordinate}
                y={yCordinate}
                textAnchor="end"
                fontSize={14}
                fill={labelsColor}
                fontWeight="400"
            >
                {yAxisPrefix + numeral(value).format('0,0')}
            </Text>
        );
    });
};

const AnimatedLine = ({ d, color }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: 1000 - (progress.value * 1000),
    }));

    return (
        <AnimatedPath
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH_LINE}
            strokeDasharray={1000}
            animatedProps={animatedProps}
        />
    );
};

const buildPaths = (chartHeight, chartWidth, datasets, higherPoint) => {
    return datasets.map((dataset, index) => {
        const d = buildPathD(chartHeight, chartWidth, dataset.data, higherPoint);
        return <AnimatedLine key={index} d={d} color={dataset.color} />;
    });
};

const AnimatedDot = ({ cx, cy, fill }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        r: DOT_RADIUS * scale.value,
    }));

    return <AnimatedCircle cx={cx} cy={cy} fill={fill} animatedProps={animatedProps} />;
};

const buildDots = (chartHeight, chartWidth, datasets, higherPoint) => {
    return datasets.flatMap((dataset, datasetIndex) => {
        const pointCoordinates = buildPointCoordinates(chartHeight, chartWidth, dataset.data, higherPoint);
        return pointCoordinates.map((p, pointIndex) => (
            <AnimatedDot
                key={`${datasetIndex}-${pointIndex}`}
                cx={p.x}
                cy={p.y}
                fill={dataset.color}
            />
        ));
    });
};

const buildPointCoordinates = (chartHeight, chartWidth, dataset = [], higherPoint) => {
    const xSeparation = dataset.length > 1 ? chartWidth / (dataset.length - 1) : chartWidth;
    const yRatio = higherPoint / chartHeight;

    return dataset.map((point, index) => ({
        x: (index * xSeparation) + PADDING.LEFT,
        y: (chartHeight - (point / yRatio)) + PADDING.TOP
    }));
};

const buildPathD = (chartHeight, chartWidth, dataset, higherPoint) => {
    const pointCoordinates = buildPointCoordinates(chartHeight, chartWidth, dataset, higherPoint);
    return pointCoordinates.reduce((d, p, index) =>
        index === 0 ? `M${p.x} ${p.y}` : `${d} L${p.x} ${p.y}`,
        '');
};

export default LineChart;