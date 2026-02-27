import React, { createContext, useState, useEffect } from 'react';
import { GetData, StoreData } from "../helpers/async-storage-helper"
import { setSessionHash as setApiSessionHash } from '../api/axiosClient';

type ScppContextType = {
    sessionHash: string;
    updateSessionHash: (value: string) => void;
    clearSession: () => Promise<void>;
    isReady: boolean;
};

type ScppProviderProps = {
    children: React.ReactNode;
};

export const ScppContext = createContext<ScppContextType>({
    sessionHash: "",
    updateSessionHash: () => { },
    clearSession: async () => { },
    isReady: false,
});

export const ScppProvider: React.FC<ScppProviderProps> = ({ children }) => {
    const [sessionHash, setSessionHash] = useState<string>("");
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await GetData('sessionHash');
            if (data) {
                setSessionHash(data);
                setApiSessionHash(data);
            }
            setIsReady(true)
        };
        fetchData();
    }, []);

    const updateSessionHash = async (value: string) => {
        setSessionHash(value)
        setApiSessionHash(value);
        await StoreData("sessionHash", value)
    };

    const clearSession = async () => {
        setSessionHash("");
        setApiSessionHash(null);
        await StoreData("sessionHash", "");
    };

    return (
        <ScppContext.Provider value={{ sessionHash, updateSessionHash, clearSession, isReady }}>
            {children}
        </ScppContext.Provider>
    );
};

export default ScppProvider;
