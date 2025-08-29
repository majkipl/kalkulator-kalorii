// /src/components/auth/AuthPage.js

import React, {useState, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {loginSchema, registerSchema, resetSchema} from '../../schemas/authSchema';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {auth} from '../../firebase/config';
import {LucideCat} from 'lucide-react';

// Importy hooków, stylów i komponentów
import {useNavigate} from 'react-router-dom';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles} from '../../utils/formStyles';
import Spinner from '../../shared/Spinner'; // Załóżmy, że Spinner jest potrzebny

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const AuthPage = () => {
    const {showToast} = useAppContext();
    const navigate = useNavigate();

    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'reset'
    const [firebaseError, setFirebaseError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Dynamiczne wybieranie schematu walidacji w zależności od trybu
    const currentSchema = useMemo(() => {
        if (authMode === 'register') return registerSchema;
        if (authMode === 'reset') return resetSchema;
        return loginSchema;
    }, [authMode]);

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(currentSchema),
    });

    const handleModeChange = (newMode) => {
        setAuthMode(newMode);
        setFirebaseError('');
        reset(); // Czyści formularz i błędy walidacji przy zmianie trybu
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            showToast("Zalogowano pomyślnie przez Google!");
            navigate('/select-cat');
        } catch (err) {
            let errorMessage = "Logowanie przez Google nie powiodło się.";
            if (err.code === 'auth/account-exists-with-different-credential') {
                errorMessage = "Konto z tym adresem e-mail już istnieje. Zaloguj się hasłem i połącz konto Google w ustawieniach.";
            }
            setFirebaseError(errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const processSubmit = async (data) => {
        setIsLoading(true);
        setFirebaseError('');
        const {email, password} = data;

        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Zalogowano pomyślnie!");
                navigate('/select-cat');
            } else if (authMode === 'register') {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast("Konto zostało utworzone! Możesz się teraz zalogować.");
                handleModeChange('login');
            } else if (authMode === 'reset') {
                await sendPasswordResetEmail(auth, email);
                showToast("Link do resetu hasła został wysłany na Twój e-mail.");
                handleModeChange('login');
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
            setFirebaseError(errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-center mb-6">
                    <LucideCat className="h-12 w-12 text-indigo-500"/>
                    <h1 className={`${typographyStyles.h1} ml-4`}>Dziennik Kota</h1>
                </div>

                <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
                    {authMode === 'login' && <h2 className={typographyStyles.h2}>Logowanie</h2>}
                    {authMode === 'register' && <h2 className={typographyStyles.h2}>Rejestracja</h2>}
                    {authMode === 'reset' && <h2 className={typographyStyles.h2}>Resetuj hasło</h2>}

                    <div>
                        <input type="email" placeholder="Adres e-mail"
                               className={formStyles.input} {...register("email")} />
                        <FormError message={errors.email?.message}/>
                    </div>

                    {authMode !== 'reset' && (
                        <div>
                            <input type="password" placeholder="Hasło"
                                   className={formStyles.input} {...register("password")} />
                            <FormError message={errors.password?.message}/>
                        </div>
                    )}

                    {firebaseError && <p className="text-red-500 text-sm text-center">{firebaseError}</p>}

                    <button type="submit" className={formStyles.buttonSubmit} disabled={isLoading}>
                        {isLoading ? <Spinner/> : (
                            authMode === 'login' ? 'Zaloguj się' :
                                authMode === 'register' ? 'Zarejestruj się' : 'Wyślij link'
                        )}
                    </button>
                </form>

                <div className="mt-4 text-sm">
                    {authMode === 'login' && (
                        <div className="flex justify-between items-center">
                            <button onClick={() => handleModeChange('register')}
                                    className="text-indigo-500 hover:underline">Nie masz konta? Zarejestruj się
                            </button>
                            <button onClick={() => handleModeChange('reset')}
                                    className="text-gray-500 hover:underline">Zapomniałeś hasła?
                            </button>
                        </div>
                    )}
                    {authMode === 'register' && (
                        <button onClick={() => handleModeChange('login')}
                                className="text-indigo-500 hover:underline">Masz już konto? Zaloguj się</button>
                    )}
                    {authMode === 'reset' && (
                        <button onClick={() => handleModeChange('login')}
                                className="w-full text-center text-indigo-500 hover:underline mt-2">Wróć do
                            logowania</button>
                    )}
                </div>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">LUB</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <button onClick={handleGoogleSignIn} className={formStyles.buttonGoogle} disabled={isLoading}>
                    {isLoading ? <Spinner/> : (
                        <>
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
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;