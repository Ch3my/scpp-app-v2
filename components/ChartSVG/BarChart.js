import React, { useEffect, useState, useMemo } from 'react';
import Svg, { G, Line, Text, Rect } from 'react-native-svg';
import { View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import numeral from 'numeral';

const SVGPADDINGLEFT = 90;
const SVGPADDINGRIGHT = 90;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BarChart = ({
    yAxisPrefix,
    labels,
    dataset,
    labelsColor,
}) => {
    const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

    useEffect(() => {
        const handleDimensionChange = ({ window }) => setDimensions(window);
        const subscription = Dimensions.addEventListener('change', handleDimensionChange);
        return () => subscription?.remove();
    }, []);

    const chartWidth = useMemo(() => dimensions.width - SVGPADDINGLEFT - SVGPADDINGRIGHT, [dimensions]);
    const barHeight = 20;
    const barContainerHeight = barHeight * 1.5;
    const chartHeight = useMemo(() => barContainerHeight * labels.length, [labels, barContainerHeight]);

    const maxBarWidth = useMemo(() => chartWidth - 20, [chartWidth]);
    const maxValueDataset = useMemo(() => Math.max(...dataset), [dataset]);

    const labelsY = useMemo(
        () =>
            buildLabelsY(
                yAxisPrefix,
                labels,
                dataset,
                dimensions.width,
                labelsColor,
                barContainerHeight
            ),
        [yAxisPrefix, labels, dataset, dimensions.width, labelsColor, barContainerHeight]
    );

    const lines = useMemo(
        () => buildLinesXY(chartWidth, chartHeight, labelsColor),
        [chartWidth, chartHeight, labelsColor]
    );

    const bars = useMemo(
        () =>
            buildBars(dataset, maxBarWidth, barHeight, barContainerHeight, maxValueDataset),
        [dataset, maxBarWidth, barHeight, barContainerHeight, maxValueDataset]
    );

    return (
        <View>
            <Svg height={chartHeight} width={dimensions.width}>
                {lines}
                {labelsY}
                {bars}
            </Svg>
        </View>
    );
};

const buildLinesXY = (chartWidth, chartHeight, labelsColor) => (
    <G>
        <Line
            x1={SVGPADDINGLEFT}
            x2={chartWidth + SVGPADDINGLEFT}
            y1={chartHeight}
            y2={chartHeight}
            strokeWidth="1"
            stroke={labelsColor}
        />
        <Line
            y1={chartHeight}
            y2={0}
            x1={SVGPADDINGLEFT}
            x2={SVGPADDINGLEFT}
            strokeWidth="1"
            stroke={labelsColor}
        />
    </G>
);

const buildLabelsY = (yAxisPrefix, labels, dataset, totalWidth, labelsColor, barContainerHeight) => {
    if (!labels || labels.length === 0) return null;

    return labels.map((label, index) => {
        const yCoordinate = barContainerHeight * index + barContainerHeight / 2;
        return (
            <G key={index}>
                <Text
                    y={yCoordinate}
                    textAnchor="start"
                    fill={labelsColor}
                    fontWeight="400"
                    fontSize={14}
                >
                    {label.slice(0, 12)}
                </Text>
                <Text
                    x={totalWidth - SVGPADDINGRIGHT + 60}
                    y={yCoordinate}
                    textAnchor="end"
                    fill={labelsColor}
                    fontWeight="400"
                    fontSize={14}
                >
                    {yAxisPrefix + numeral(dataset[index]).format('0,0')}
                </Text>
            </G>
        );
    });
};

const AnimatedBar = ({ x, y, maxWidth, value, maxValue, fill, height }) => {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withTiming((maxWidth * value) / maxValue, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
        });
    }, [maxWidth, value, maxValue]);

    const animatedProps = useAnimatedProps(() => ({
        width: width.value,
    }));

    return (
        <AnimatedRect
            x={x}
            y={y}
            fill={fill}
            height={height}
            animatedProps={animatedProps}
        />
    );
};

const buildBars = (dataset, maxBarWidth, barHeight, barContainerHeight, maxValueDataset) => {
    if (!dataset || dataset.length === 0) return null;

    return dataset.map((value, index) => {
        const yCoordinate = barContainerHeight * index + (barContainerHeight - barHeight) / 2;
        // x={SVGPADDINGLEFT +1} el 1 es para que no quede la barra montada en la linea
        return (
            <AnimatedBar
                key={index}
                x={SVGPADDINGLEFT + 1}
                y={yCoordinate}
                maxWidth={maxBarWidth}
                value={value}
                maxValue={maxValueDataset}
                fill="#75c2be"
                height={barHeight}
            />
        );
    });
};

export default BarChart;