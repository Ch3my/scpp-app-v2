import { StyleSheet } from 'react-native';

export const GetAppStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        padding: 10,
        flex: 1
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
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
        alignItems: 'center',
        justifyContent: 'center'
    }
});