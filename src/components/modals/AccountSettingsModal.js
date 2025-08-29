// /src/components/modals/AccountSettingsModal.js

import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {changePasswordSchema} from '../../schemas/changePasswordSchema';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    GoogleAuthProvider,
    linkWithPopup,
    updatePassword
} from 'firebase/auth';
import {auth} from '../../firebase/config';
import Spinner from '../../shared/Spinner';
import {LucideX, LucideCheckCircle} from 'lucide-react';

// Importy hooków i stylów
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles} from '../../utils/formStyles';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const AccountSettingsModal = ({onCancel}) => {
    // Pobieramy dane globalne
    const {user} = useAuth();
    const {showToast} = useAppContext();

    // Stany lokalne (dla logiki niezwiązanej z formularzem hasła)
    const [isLinking, setIsLinking] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Inicjalizacja react-hook-form dla formularza zmiany hasła
    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    const isGoogleLinked = user.providerData.some(provider => provider.providerId === 'google.com');
    const isEmailProvider = user.providerData.some(provider => provider.providerId === 'password');

    const handleLinkGoogle = async () => {
        setIsLinking(true);
        const provider = new GoogleAuthProvider();
        try {
            await linkWithPopup(auth.currentUser, provider);
            showToast("Konto Google zostało pomyślnie połączone!", "success");
        } catch (error) {
            let message = "Wystąpił błąd podczas łączenia konta.";
            if (error.code === 'auth/credential-already-in-use') {
                message = "To konto Google jest już połączone z innym użytkownikiem.";
            }
            showToast(message, "error");
        } finally {
            setIsLinking(false);
        }
    };

    // Ta funkcja jest wywoływana tylko po pomyślnej walidacji po stronie klienta
    const processPasswordChange = async (data) => {
        setIsChangingPassword(true);
        const credential = EmailAuthProvider.credential(user.email, data.currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, data.newPassword);

            showToast("Hasło zostało pomyślnie zmienione.", "success");
            reset(); // Czyści formularz
            setShowPasswordFields(false);
        } catch (error) {
            let message = "Wystąpił błąd podczas zmiany hasła.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Aktualne hasło jest nieprawidłowe.";
            } else if (error.code === 'auth/weak-password') {
                message = "Nowe hasło jest za słabe. Musi mieć co najmniej 6 znaków.";
            }
            showToast(message, "error");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className={typographyStyles.h2}>Ustawienia konta</h2>
                    <button type="button" onClick={onCancel}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p><strong className={typographyStyles.label}>E-mail:</strong> {user.email}</p>

                    <div>
                        <h3 className={`${typographyStyles.h3} text-sm font-medium mb-2`}>Połączone konta</h3>
                        {isGoogleLinked ? (
                            <div
                                className="flex items-center p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                                <LucideCheckCircle className="mr-3"/>
                                Konto połączone z Google.
                            </div>
                        ) : (
                            <button onClick={handleLinkGoogle} disabled={isLinking} className={formStyles.buttonGoogle}>
                                {isLinking ? <Spinner/> : (<>
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
                                    Połącz z kontem Google
                                </>)}
                            </button>
                        )}
                    </div>

                    {isEmailProvider && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className={`${typographyStyles.h3} text-sm font-medium mb-2`}>Zmień hasło</h3>
                            {!showPasswordFields ? (
                                <button onClick={() => setShowPasswordFields(true)}
                                        className={formStyles.buttonTertiary}>
                                    Zmień hasło
                                </button>
                            ) : (
                                <form onSubmit={handleSubmit(processPasswordChange)}
                                      className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <input type="password" placeholder="Aktualne hasło"
                                               className={formStyles.input} {...register("currentPassword")} />
                                        <FormError message={errors.currentPassword?.message}/>
                                    </div>
                                    <div>
                                        <input type="password" placeholder="Nowe hasło"
                                               className={formStyles.input} {...register("newPassword")} />
                                        <FormError message={errors.newPassword?.message}/>
                                    </div>
                                    <div>
                                        <input type="password" placeholder="Potwierdź nowe hasło"
                                               className={formStyles.input} {...register("confirmPassword")} />
                                        <FormError message={errors.confirmPassword?.message}/>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => {
                                            setShowPasswordFields(false);
                                            reset();
                                        }} className={`${formStyles.buttonCancel} w-auto text-sm px-3 py-1.5`}>Anuluj
                                        </button>
                                        <button type="submit" disabled={isChangingPassword}
                                                className={`${formStyles.buttonSubmit} w-auto text-sm px-3 py-1.5`}>
                                            {isChangingPassword ? <Spinner/> : 'Zapisz zmianę'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end pt-6">
                    <button onClick={onCancel} className={formStyles.buttonCancel}>Zamknij</button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsModal;