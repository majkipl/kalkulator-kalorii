// /src/components/modals/DeleteCatModal.js

import React, {useState, useRef, useEffect} from 'react';
import {LucideAlertTriangle} from 'lucide-react';
import Spinner from '../../shared/Spinner';
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

const DeleteCatModal = ({onConfirm, onCancel}) => {
    const {showToast} = useAppContext();
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // 1. Tworzymy referencję do inputa
    const passwordInputRef = useRef(null);

    // 2. Efekt, który ustawi focus, gdy komponent się zamontuje
    useEffect(() => {
        setTimeout(() => {
            passwordInputRef.current?.focus();
        }, 100);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            showToast("Proszę podać hasło.", "error");
            return;
        }
        setIsVerifying(true);
        const success = await onConfirm(password);
        if (!success) {
            setIsVerifying(false);
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up">
                <div className="flex flex-col items-center text-center">
                    <LucideAlertTriangle className="h-12 w-12 text-red-500 mb-4"/>
                    <h3 className={typographyStyles.h2}>Czy na pewno usunąć profil?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">
                        Ta operacja jest nieodwracalna. Wszystkie dane kota zostaną trwale usunięte. Aby potwierdzić,
                        wprowadź swoje hasło.
                    </p>
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Twoje hasło"
                            className={`${formStyles.input} text-center`}
                            required
                            ref={passwordInputRef} // 3. Dowiązujemy ref
                        />
                        <div className="flex justify-center space-x-4 w-full">
                            <button type="button" onClick={onCancel} disabled={isVerifying}
                                    className={formStyles.buttonCancel}>
                                Anuluj
                            </button>
                            <button type="submit" disabled={isVerifying} className={formStyles.buttonDestructive}>
                                {isVerifying ? <Spinner/> : 'Potwierdź usunięcie'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeleteCatModal;