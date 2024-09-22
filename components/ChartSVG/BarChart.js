import React, { useEffect, useState } from 'react';
import Svg, { G, Line, Text, Rect } from "react-native-svg";
import { View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import numeral from 'numeral';

const SVGPADDINGLEFT = 100;
const SVGPADDINGRIGHT = 100;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BarChart = props => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });
        return () => subscription?.remove();
    });

    const chartWidth = dimensions.width - SVGPADDINGLEFT - SVGPADDINGRIGHT;
    const barHeight = 20;
    const barContainerHeight = barHeight * 1.5;
    const chartHeight = barContainerHeight * props.labels.length;

    let labelsY = buildLabelsY(props.yAxisPrefix, props.labels, props.dataset, dimensions.width, props.labelsColor, barContainerHeight);
    let lines = buildLinesXY(chartWidth, chartHeight, props.labelsColor);
    let bars = buildBars(props.dataset, chartWidth, barHeight, barContainerHeight);

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

const buildLinesXY = (chartWidth, chartHeight, labelsColor) => {
    return (
        <G>
            <Line x1={SVGPADDINGLEFT} x2={chartWidth + SVGPADDINGLEFT} y1={chartHeight} y2={chartHeight} strokeWidth="1" stroke={labelsColor} />
            <Line y1={chartHeight} y2={0} x1={SVGPADDINGLEFT} x2={SVGPADDINGLEFT} strokeWidth="1" stroke={labelsColor} />
        </G>
    );
};

const buildLabelsY = (yAxisPrefix, labels, dataset, totalWidth, labelsColor, barContainerHeight) => {
    if (!labels || labels.length === 0) {
        return null;
    }
    return labels.map((l, index) => {
        const yCordinate = (barContainerHeight * index) + (barContainerHeight / 2);
        return (
            <G key={index}>
                <Text y={yCordinate} textAnchor="start"
                    stroke={labelsColor} fontWeight="100" fontSize="12">{l}</Text>
                <Text x={totalWidth - SVGPADDINGRIGHT + 60} y={yCordinate} textAnchor="end"
                    stroke={labelsColor} fontWeight="100" fontSize="12">{yAxisPrefix + numeral(dataset[index]).format('0,0')}</Text>
            </G>
        );
    });
};

const AnimatedBar = ({ x, y, maxWidth, value, maxValue, fill, height }) => {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = 0 // Without this bars dessapear on hot reload 
        width.value = withTiming(maxWidth * (value / maxValue), {
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

const buildBars = (dataset = [], chartWidth, barHeight, barContainerHeight) => {
    if (!dataset || dataset.length === 0) {
        return null;
    }
    const maxBarWidth = chartWidth - 10;
    const maxValueDataset = Math.max(...dataset);

    return dataset.map((d, index) => {
        const yCordinate = (barContainerHeight * index) + ((barContainerHeight - barHeight) / 2);
        // x={SVGPADDINGLEFT +1} el 1 es para que no quede la barra montada en la linea
        return (
            <AnimatedBar
                key={index}
                x={SVGPADDINGLEFT +1}
                y={yCordinate}
                maxWidth={maxBarWidth}
                value={d}
                maxValue={maxValueDataset}
                fill='#75c2be'
                height={barHeight}
            />
        );
    });
};

export default BarChart;