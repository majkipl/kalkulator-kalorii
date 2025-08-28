import React, { useState } from 'react';
import { LucideAlertTriangle } from 'lucide-react';
import Spinner from '../../shared/Spinner';
import { useAppContext } from '../../context/AppContext';

const DeleteCatModal = ({ onConfirm, onCancel }) => {
    const { showToast } = useAppContext();
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

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
                    <LucideAlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Czy na pewno usunąć profil?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">
                        Ta operacja jest nieodwracalna. Wszystkie dane kota (posiłki, waga, badania) zostaną trwale usunięte. Aby potwierdzić, wprowadź swoje hasło.
                    </p>
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Twoje hasło"
                            className="w-full text-center border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                            required
                        />
                        <div className="flex justify-center space-x-4 w-full">
                            <button type="button" onClick={onCancel} disabled={isVerifying} className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj</button>
                            <button type="submit" disabled={isVerifying} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50">
                                {isVerifying ? <Spinner /> : 'Potwierdź usunięcie'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeleteCatModal;