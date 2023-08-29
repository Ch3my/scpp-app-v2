import React, { createContext, useState, useEffect } from 'react';
import { GetData, StoreData } from "../helpers/async-storage-helper"

type ScppContextType = {
    sessionHash: string;
    apiPrefix: string; // Updated variable name
    updateSessionHash: (value: string) => void;
    isReady: boolean
};

type ScppProviderProps = {
    children: React.ReactNode;
};

export const ScppContext = createContext<ScppContextType>({
    sessionHash: "",
    apiPrefix: "https://scpp.lezora.cl",
    updateSessionHash: () => { },
    isReady: false
});

export const ScppProvider: React.FC<ScppProviderProps> = ({
    children,
}) => {
    const [sessionHash, setSessionHash] = useState<string>("");
    const [apiPrefix, setApiPrefix] = useState("https://scpp.lezora.cl");
    const [isReady, setIsReady] = useState(false);

    // carga sesionhash si existe?
    useEffect(() => {
        const fetchData = async () => {
            const data = await GetData('sessionHash');
            if (data) {
                setSessionHash(data);
            }
            setIsReady(true)
        };
        fetchData();
    }, []); // Fetch data once when the component mounts

    const updateSessionHash = async (value: string) => {
        setSessionHash(value)
        await StoreData("sessionHash", value)
    };


    return (
        <ScppContext.Provider
            value={{ sessionHash, apiPrefix, updateSessionHash, isReady }} // Updated variable name
        >
            {children}
        </ScppContext.Provider>
    );
};
