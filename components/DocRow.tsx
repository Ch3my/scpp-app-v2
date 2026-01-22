import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../app/ScppThemeContext';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import numeral from 'numeral';
import { GetAppStyles } from "../styles/styles"
import { Documento } from '../models/Documento';

interface DocumentItemProps {
    item: Documento;
    rightSwipe: (progress: any, dragX: any, id: number) => React.ReactNode;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ item, rightSwipe }) => {
    const theme = useTheme();
    const appStyles = useMemo(() => GetAppStyles(theme), [theme]);

    return (
        <ReanimatedSwipeable
            renderRightActions={(progress, dragX) => rightSwipe(progress, dragX, item.id)}
            key={item.id}
            friction={1}
        >
            <View
                style={{
                    backgroundColor: theme.colors.background,
                    flexDirection: 'row',
                    padding: 10,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.surfaceVariant,
                }}
            >
                <View style={{ flex: 0.6 }}>
                    <Text style={appStyles.textFontSize}>{item.fecha}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[appStyles.textFontSize, {textAlignVertical: 'center'}]}>{item.proposito}</Text>
                </View>
                <View style={{ flex: 0.6 }}>
                    <Text style={[appStyles.textFontSize, { textAlign: 'right' }]}>
                        {numeral(item.monto).format('0,0')}
                    </Text>
                </View>
            </View>
        </ReanimatedSwipeable>
    );
};

export default React.memo(DocumentItem);
