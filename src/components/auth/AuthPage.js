// /src/components/auth/AuthPage.js

import React, {useState} from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {auth} from '../../firebase/config';
import {LucideCat} from 'lucide-react';

// Importy hooków z React Router i Context API
import {useNavigate} from 'react-router-dom';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles} from '../../utils/formStyles';

const AuthPage = () => {
    // Pobieramy potrzebne funkcje z hooków
    const {showToast} = useAppContext();
    const navigate = useNavigate();

    // Stany lokalne komponentu (bez zmian)
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            showToast("Zalogowano pomyślnie przez Google!");
            navigate('/select-cat'); // Nawigacja po sukcesie
        } catch (err) {
            let errorMessage = "Logowanie przez Google nie powiodło się.";
            if (err.code === 'auth/account-exists-with-different-credential') {
                errorMessage = "Konto z tym adresem e-mail już istnieje. Zaloguj się hasłem i połącz konto Google w ustawieniach.";
            } else {
                console.error("Google Sign-In Error:", err);
            }
            setError(errorMessage);
            showToast(errorMessage, "error");
        }
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Zalogowano pomyślnie!");
                navigate('/select-cat'); // Nawigacja po sukcesie
            } else if (authMode === 'register') {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast("Konto zostało utworzone!");
                navigate('/login'); // Przekieruj na logowanie po rejestracji
            } else if (authMode === 'reset') {
                await sendPasswordResetEmail(auth, email);
                showToast("Link do resetu hasła został wysłany na Twój e-mail.");
                setAuthMode('login');
            }
        } catch (err) {
            let errorMessage = "Wystąpił nieoczekiwany błąd.";
            switch (err.code) {
                case 'auth/invalid-email':
                    errorMessage = "Nieprawidłowy format adresu e-mail.";
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "Nieprawidłowy e-mail lub hasło.";
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = "Ten adres e-mail jest już zajęty.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Hasło musi mieć co najmniej 6 znaków.";
                    break;
                default:
                    console.error("Auth Error:", err);
            }
            setError(errorMessage);
            showToast(errorMessage, "error");
        }
    };

    const renderForm = () => {
        if (authMode === 'reset') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">Resetuj
                        hasło</h2>
                    <form onSubmit={handleAuthAction} className="space-y-4">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                               placeholder="Adres e-mail" className={formStyles.input} required/>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className={formStyles.buttonSubmit}>Wyślij link</button>
                    </form>
                    <button onClick={() => setAuthMode('login')}
                            className="w-full mt-4 text-sm text-indigo-500 hover:underline">Wróć do logowania
                    </button>
                </>
            );
        }

        return (
            <>
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">{authMode === 'login' ? 'Logowanie' : 'Rejestracja'}</h2>
                <form onSubmit={handleAuthAction} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                           placeholder="Adres e-mail" className={formStyles.input} required/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                           placeholder="Hasło" className={formStyles.input} required/>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit"
                            className={formStyles.buttonSubmit}>
                        {authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                    </button>
                </form>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                            className={formStyles.buttonGoogle}>
                        {authMode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
                    </button>
                    {authMode === 'login' && <button onClick={() => setAuthMode('reset')}
                                                     className="text-sm text-gray-500 hover:underline">Zapomniałeś
                        hasła?</button>}
                </div>
            </>
        );
    };

    return (
        <div
            className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-center mb-6">
                    <LucideCat className="h-12 w-12 text-indigo-500"/>
                    <h1 className={`${typographyStyles.h1} ml-4`}>Dziennik Kota</h1>
                </div>
                {renderForm()}
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">LUB</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <button onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition hover:bg-gray-50 dark:hover:bg-gray-600">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#FFC107"
                              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.398 12.58C34.783 9.338 29.833 7 24 7C12.955 7 4 15.955 4 27s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                        <path fill="#FF3D00"
                              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039L38.398 12.58C34.783 9.338 29.833 7 24 7C16.318 7 9.656 10.337 6.306 14.691z"></path>
                        <path fill="#4CAF50"
                              d="M24 47c5.833 0 10.783-2.338 14.398-5.58l-6.522-5.027C29.545 38.973 26.911 40 24 40c-5.044 0-9.348-3.108-11.119-7.471l-6.571 4.819C9.656 42.663 16.318 47 24 47z"></path>
                        <path fill="#1976D2"
                              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.58l6.522 5.027C43.089 36.69 46 32.25 46 27c0-1.341-.138-2.65-.389-3.917z"></path>
                    </svg>
                    Zaloguj się z Google
                </button>
            </div>
        </div>
    );
};

export default AuthPage;