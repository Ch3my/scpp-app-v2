import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export const GetAppStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        padding: 10
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        margin: 10
    },
    btnRowBtn: {
        marginHorizontal: 5
    },
    camera: {
        height: 500,
        width: "90%",
        marginVertical: 5
    },
    cameraContent: {
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    centerContentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});