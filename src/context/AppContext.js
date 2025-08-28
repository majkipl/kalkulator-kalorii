// /src/context/AppContext.js

import React, {createContext, useContext, useState, useCallback} from 'react';
import Toast from '../shared/Toast';
import useTheme from '../hooks/useTheme';

const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [toast, setToast] = useState(null);
    const [theme, setTheme] = useTheme();

    // Używamy useCallback, aby funkcja showToast była stabilna
    // i nie powodowała niepotrzebnych re-renderów w komponentach, które jej używają.
    const showToast = useCallback((message, type = 'success') => {
        setToast({message, type, id: Date.now()});
    }, []); // Pusta tablica zależności jest tu poprawna, bo `setToast` nigdy się nie zmienia.

    const value = {
        showToast,
        theme,
        setTheme,
    };

    return (
        <AppContext.Provider value={value}>
            {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};