/* Picker dejo de ser compatible asi que simulamos un equivalente
con diferentes componentes
NOTA. PaperText es un componente de texto que sigue las normas del tema aplicado
*/
import { useState, useContext, useEffect } from 'react';
import { Button, Dialog, Portal, List } from 'react-native-paper';
import { View, FlatList, Keyboard } from 'react-native';
import axios from 'axios'
import { ScppProvider, ScppContext } from "../app/ScppContext"

const CategoriaPicker = props => {
    const { sessionHash, apiPrefix, isReady } = useContext(ScppContext);
    const [listOfCategoria, setListOfCategoria] = useState([]);
    // Emite evento al padre para actalizar
    const emitEventUpdateCategoria = ({ id, descripcion }) => {
        props.onUpdateCategoria({ id, descripcion });
        setVisible(false);
    }

    // Dialog Stuff
    const [visible, setVisible] = useState(false)
    const showDialog = () => {
        if (props.hideKeyboardOnShow) {
            // Si el parametro viene true. Ocultamos el Keyboard
            Keyboard.dismiss()
        }
        setVisible(true)
    }
    const hideDialog = () => {
        setVisible(false)
        props.openDialogControl = false
    }

    useEffect(() => {
        // Fetch dat from API and build Picker
        const getTipoDocAsync = async () => {
            // Obtiene la Session 
            let categoria = await axios.get(apiPrefix + '/categorias', {
                params: {
                    sessionHash
                }
            }).catch((err) => { console.log(err) })
            // Probablemente este Error es que el Token no es valido
            // Cerramos la Sesion
            if (categoria.data.hasErrors) {
                // logout(sessionHash)
            } else {
                setListOfCategoria(categoria.data)
            }
        };
        getTipoDocAsync();
    }, []);

    useEffect(()=> {
        if(props.openDialogControl == true) {
            showDialog()
        }
    },[props.openDialogControl])

    // Axios CancelToken when unmounted. Evitar mensaje NoOp?

    return (
        <View>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={{ height: '80%' }}>
                    <Dialog.Title>Categoria</Dialog.Title>
                    <Dialog.ScrollArea>
                        <FlatList
                            data={listOfCategoria}
                            renderItem={({ item }) => {
                                return (
                                    <List.Item
                                        title={item.descripcion}
                                        key={item.id}
                                        onPress={() => emitEventUpdateCategoria({
                                            id: item.id,
                                            descripcion: item.descripcion
                                        })} />
                                )
                            }} />
                    </Dialog.ScrollArea>
                </Dialog>
            </Portal>
        </View>
    )
}

export default CategoriaPicker;
