import React from 'react';
import {LucideAlertTriangle} from 'lucide-react';

const ConfirmationModal = ({message, onConfirm, onCancel}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
                <LucideAlertTriangle className="h-12 w-12 text-red-500 mb-4"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Potwierdzenie</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">{message}</p>
                <div className="flex justify-center space-x-4 w-full">
                    <button onClick={onCancel}
                            className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj
                    </button>
                    <button onClick={onConfirm}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">Usuń
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default ConfirmationModal;