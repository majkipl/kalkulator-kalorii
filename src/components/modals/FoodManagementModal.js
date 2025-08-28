import React, { useState, useMemo } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-subtle.css';

// Importy hooków i komponentów
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import { LucideX, LucideBone, LucideClipboardEdit, LucideTrash2, LucideEye, LucideEyeOff } from 'lucide-react';

const FoodManagementModal = ({ foods, hiddenFoodIds, onToggleHide, onCancel, onEdit, onDelete }) => {
    // Pobieramy dane o użytkowniku bezpośrednio z kontekstu
    const { user } = useAuth();

    // Stany lokalne (bez zmian)
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHidden, setShowHidden] = useState(false);

    const inputClassName = "block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";

    const filteredFoods = useMemo(() => {
        return foods
            .filter(food => {
                const isHidden = hiddenFoodIds.includes(food.id);
                return showHidden ? isHidden : !isHidden;
            })
            .filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [foods, searchTerm, showHidden, hiddenFoodIds]);

    const handleDeleteRequest = (foodId) => {
        setConfirmingDelete(foodId);
    };

    const confirmDelete = () => {
        onDelete(confirmingDelete);
        setConfirmingDelete(null);
    };

    const ImageWithTooltip = ({ food }) => {
        const imageContent = (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center flex-shrink-0">
                {food.photoURL ? (
                    <img src={food.photoURL} alt={food.name} className="w-full h-full object-cover rounded-md" />
                ) : (
                    <LucideBone className="w-6 h-6 text-gray-400" />
                )}
            </div>
        );

        if (food.photoURL) {
            return (
                <Tippy
                    content={<img src={food.photoURL} alt={`Powiększenie ${food.name}`} className="w-36 h-36 object-contain rounded-md" />}
                    placement="top"
                    animation="scale-subtle"
                    delay={[100, 0]}
                >
                    {imageContent}
                </Tippy>
            );
        }
        return imageContent;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up flex flex-col" style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Zarządzaj karmami</h2>
                    <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX /></button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Wyszukaj karmę..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputClassName}
                    />
                    <label className="flex items-center whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"/>
                        Pokaż ukryte
                    </label>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="space-y-3">
                        {filteredFoods.length > 0 ? filteredFoods.map(food => {
                            // Teraz `user` pochodzi z `useAuth()` i nie będzie `undefined`
                            const isOwner = food.ownerId === user.uid;
                            const isHidden = hiddenFoodIds.includes(food.id);
                            return (
                                <div key={food.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <ImageWithTooltip food={food} />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{food.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{food.type}, {food.calories} kcal/100g {!isOwner && food.ownerId && <span className='italic'>(Inny użytkownik)</span>}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {isOwner && <button onClick={() => onEdit(food)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-600 transition" title="Edytuj"><LucideClipboardEdit className="h-5 w-5" /></button>}
                                        {isOwner && <button onClick={() => handleDeleteRequest(food.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition" title="Usuń"><LucideTrash2 className="h-5 w-5" /></button>}
                                        <button onClick={() => onToggleHide(food.id, isHidden)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600 transition" title={isHidden ? "Odkryj" : "Ukryj"}>
                                            {isHidden ? <LucideEye className="h-5 w-5" /> : <LucideEyeOff className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{showHidden ? "Brak ukrytych karm." : "Brak karm do wyświetlenia."}</p>
                        )}
                    </div>
                </div>
            </div>
            {confirmingDelete && <ConfirmationModal message="Czy na pewno chcesz usunąć tę karmę? Tej operacji nie można cofnąć." onConfirm={confirmDelete} onCancel={() => setConfirmingDelete(null)} />}
        </div>
    );
};

export default FoodManagementModal;