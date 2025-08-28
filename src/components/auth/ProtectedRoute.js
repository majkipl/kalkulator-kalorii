import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';

const ProtectedRoute = ({children}) => {
    const {user} = useAuth();

    if (!user) {
        // Jeśli użytkownik nie jest zalogowany, przekieruj go na stronę logowania
        return <Navigate to="/login"/>;
    }

    // Jeśli jest zalogowany, wyświetl komponent, który jest "chroniony"
    return children;
};

export default ProtectedRoute;