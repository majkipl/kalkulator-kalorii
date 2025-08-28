import React, {createContext, useState, useEffect, useContext} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '../firebase/config';
import Spinner from '../shared/Spinner';

// 1. Tworzymy kontekst
const AuthContext = createContext();

// 2. Tworzymy "Providera" - komponent, który będzie dostarczał dane
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Nasłuchujemy na zmiany stanu autentykacji z Firebase
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser && !currentUser.isAnonymous ? currentUser : null);
            setLoading(false);
        });

        // Sprzątamy po sobie, gdy komponent jest odmontowywany
        return () => unsubscribe();
    }, []);

    // Jeśli wciąż weryfikujemy użytkownika, pokazujemy spinner
    if (loading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    // Dostarczamy `user` i `loading` do wszystkich komponentów podrzędnych
    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Tworzymy customowy hook - to uprości korzystanie z kontekstu
export const useAuth = () => {
    return useContext(AuthContext);
};