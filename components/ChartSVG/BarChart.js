import React, { useEffect } from 'react';
import Svg, { G, Circle, Path, Line, Polyline, Text, Rect } from "react-native-svg";
import {
    View, Dimensions, StyleSheet
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import numeral from 'numeral';

const SVGPADDING = 80;
const SVGPADDINGTOP = 30;
const SVGPADDINGLEFT = 120;
const BARCONTAINERHEIGHT = 40;
const BARHEIGHT = 30;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BarChart = props => {
    let chartHeight = (props.labels ? props.labels.length : 0) * BARCONTAINERHEIGHT;
    let chartWidth = props.totalWidth - 80;

    let labelsY = buildLabelsY(props.yAxisPrefix, props.labels, props.dataset, props.totalWidth, props.labelsColor);
    let lines = buildLinesXY(chartWidth, chartHeight, props.labelsColor);
    let bars = buildBars(props.dataset, chartWidth);

    return (
        <View>
            <Svg height={chartHeight + SVGPADDING} width={props.totalWidth}>
                {lines}
                {labelsY}
                {bars}
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

const buildLabelsY = (yAxisPrefix, labels, dataset, totalWidth, labelsColor) => {
    if (!labels || labels.length === 0) {
        return null; // or return an empty array []
    }
    return labels.map((l, index) => {
        const yCordinate = (BARCONTAINERHEIGHT * index) + SVGPADDINGTOP + 20;
        return (
            <G key={index}>
                <Text x={15} y={yCordinate} textAnchor="start"
                    stroke={labelsColor} fontWeight="100">{l}</Text>
                <Text x={totalWidth - 15} y={yCordinate} textAnchor="end"
                    stroke={labelsColor} fontWeight="100">{yAxisPrefix + numeral(dataset[index]).format('0,0')}</Text>
            </G>
        );
    });
};

const AnimatedBar = ({ x, y, maxWidth, value, maxValue, fill }) => {
    const width = useSharedValue(0);

    useEffect(() => {
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
            height={BARHEIGHT}
            animatedProps={animatedProps}
        />
    );
};

const buildBars = (dataset = [], chartWidth) => {
    if (!dataset || dataset.length === 0) {
        return null; // or return an empty array []
    }
    const maxBarWidth = chartWidth - SVGPADDINGLEFT;
    const maxValueDataset = Math.max(...dataset);

    return dataset.map((d, index) => {
        const yCordinate = (BARCONTAINERHEIGHT * index) + SVGPADDINGTOP;

        return (
            <AnimatedBar
                key={index}
                x={SVGPADDINGLEFT}
                y={yCordinate}
                maxWidth={maxBarWidth}
                value={d}
                maxValue={maxValueDataset}
                fill='#75c2be'
            />
        );
    });
};

const styles = StyleSheet.create({});

export default BarChart;