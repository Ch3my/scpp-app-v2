import {
    useTheme, Text, Appbar,
    Modal, Portal, IconButton
} from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

export default () => {
    const { id } = useLocalSearchParams();

    return (
        <Text>EDIT DOC {id}</Text>
    )
}