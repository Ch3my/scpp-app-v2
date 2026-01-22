import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../app/ScppThemeContext';
import { GetAppStyles } from "../styles/styles"

const DocHeader: React.FC = () => {
    const theme = useTheme();
    const appStyles = useMemo(() => GetAppStyles(theme), [theme]);
    return (
        <View style={{
            backgroundColor: theme.colors.surfaceVariant,
            flexDirection: 'row',
            padding: 10,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
        }}>
            <View style={{ flex: 0.6 }}>
                <Text style={appStyles.textFontSize}>Fecha</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={appStyles.textFontSize}>Proposito</Text>
            </View>
            <View style={{ flex: 0.6, alignSelf: 'flex-end' }}>
                <Text style={[appStyles.textFontSize, { textAlign: 'right' }]}>
                    Monto
                </Text>
            </View>
        </View>
    );
};

export default memo(DocHeader);