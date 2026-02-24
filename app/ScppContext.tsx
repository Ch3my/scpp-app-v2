import React, { createContext, useState, useEffect } from 'react';
import { GetData, StoreData } from "../helpers/async-storage-helper"
import { AxiosResponse } from 'axios'
import apiClient, { setSessionHash as setApiSessionHash } from '../api/axiosClient';
import { Categoria } from '../models/Categoria';
import { TipoDoc } from '../models/TipoDoc';

type ScppContextType = {
    sessionHash: string;
    apiPrefix: string;
    updateSessionHash: (value: string) => void;
    setRefetchdocs: (value: boolean) => void;
    isReady: boolean;
    refetchDocs: boolean,
    categorias: Categoria[],
    tipoDocumentos: TipoDoc[],
    fetchAyudas: () => void
};

type ScppProviderProps = {
    children: React.ReactNode;
};

export const ScppContext = createContext<ScppContextType>({
    sessionHash: "",
    apiPrefix: "https://scpp.lezora.cl",
    updateSessionHash: () => { },
    isReady: false,
    refetchDocs: false,
    setRefetchdocs: () => { },
    categorias: [],
    tipoDocumentos: [],
    fetchAyudas: () => { }
});

export const ScppProvider: React.FC<ScppProviderProps> = ({
    children,
}) => {
    const [sessionHash, setSessionHash] = useState<string>("");
    const [apiPrefix, setApiPrefix] = useState("https://scpp.lezora.cl");
    const [isReady, setIsReady] = useState(false);
    const [refetchDocs, setRefetchdocs] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [tipoDocumentos, setTipoDocumentos] = useState([]);

    // carga sesionhash si existe?
    useEffect(() => {
        const fetchData = async () => {
            const data = await GetData('sessionHash');
            if (data) {
                setSessionHash(data);
                setApiSessionHash(data); // Sync to axios client
            }
            setIsReady(true)
        };
        fetchData();
    }, []); // Fetch data once when the component mounts

    const updateSessionHash = async (value: string) => {
        setSessionHash(value)
        setApiSessionHash(value); // Sync to axios client
        await StoreData("sessionHash", value)
    };

    const fetchAyudas = async () => {
        const getCategorias = async () => {
            try {
                const response: AxiosResponse<any> = await apiClient.get('/categorias');
                if (response.data) {
                    setCategorias(response.data)
                }
            } catch (error) {
                console.log(error);
            }
        };
        const getTipoDoc = async () => {
            try {
                const response: AxiosResponse<any> = await apiClient.get('/tipo-docs');
                if (response.data) {
                    setTipoDocumentos(response.data)
                }
            } catch (error) {
                console.log(error);
            }
        };
        getTipoDoc()
        getCategorias();
    }

    return (
        <ScppContext.Provider
            value={{
                sessionHash, apiPrefix, updateSessionHash, isReady, refetchDocs,
                setRefetchdocs, categorias, tipoDocumentos, fetchAyudas
            }}
        >
            {children}
        </ScppContext.Provider>
    );
};

export default ScppProvider