import React, {useState} from 'react';
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

// Importy hooków
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';

const AccountSettingsModal = ({onCancel}) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const {user} = useAuth();
    const {showToast} = useAppContext();

    // Stany lokalne (bez zmian)
    const [isLinking, setIsLinking] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // `user` jest teraz pobierany z kontekstu i nie będzie `undefined`
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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("Nowe hasła nie są zgodne.", "error");
            return;
        }
        if (!currentPassword || !newPassword) {
            showToast("Wszystkie pola hasła są wymagane.", "error");
            return;
        }

        setIsChangingPassword(true);
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            showToast("Hasło zostało pomyślnie zmienione.", "success");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
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

    // Reszta komponentu bez zmian
    const inputClassName = "w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ustawienia konta</h2>
                    <button type="button" onClick={onCancel}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p><strong>E-mail:</strong> {user.email}</p>

                    <div>
                        <h3 className="text-sm font-medium mb-2">Połączone konta</h3>
                        {isGoogleLinked ? (
                            <div
                                className="flex items-center p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                                <LucideCheckCircle className="mr-3"/>
                                Konto połączone z Google.
                            </div>
                        ) : (
                            <button onClick={handleLinkGoogle} disabled={isLinking}
                                    className="w-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-semibold py-2 px-4 rounded-lg transition hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
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
                            <h3 className="text-sm font-medium mb-2">Zmień hasło</h3>
                            {!showPasswordFields ? (
                                <button onClick={() => setShowPasswordFields(true)}
                                        className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 font-bold py-2 px-4 rounded-lg transition">
                                    Zmień hasło
                                </button>
                            ) : (
                                <form onSubmit={handleChangePassword}
                                      className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div><input type="password" value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                placeholder="Aktualne hasło" className={inputClassName} required/></div>
                                    <div><input type="password" value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)} placeholder="Nowe hasło"
                                                className={inputClassName} required/></div>
                                    <div><input type="password" value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="Potwierdź nowe hasło" className={inputClassName} required/>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => setShowPasswordFields(false)}
                                                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm">Anuluj
                                        </button>
                                        <button type="submit" disabled={isChangingPassword}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center">
                                            {isChangingPassword ? <Spinner/> : 'Zapisz zmianę'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end pt-6">
                    <button onClick={onCancel}
                            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsModal;