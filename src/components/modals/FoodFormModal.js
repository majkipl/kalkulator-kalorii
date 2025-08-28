// /src/components/modals/FoodFormModal.js

import React, {useState, useRef} from 'react';
import Select from 'react-select';
import {LucideX, LucideCat} from 'lucide-react';

// Importy hooków i stylów
import {useAppContext} from '../../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../../utils/formStyles';

const FoodFormModal = ({onSave, onCancel, initialData}) => {
    // Pobieramy dane globalne z kontekstu
    const {theme, showToast, isDark} = useAppContext();

    // Stany lokalne
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || 'mokra',
        calories: initialData?.calories || '',
        photoURL: initialData?.photoURL || ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    // Style dla react-select
    const foodTypeOptions = [{value: 'mokra', label: 'Mokra'}, {value: 'sucha', label: 'Sucha'}];
    const customStyles = getCustomSelectStyles(isDark);

    // Handlery
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast("Plik jest za duży. Maksymalny rozmiar to 5MB.", "error");
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setFormData(prev => ({...prev, photoURL: dataUrl}));
                setIsProcessing(false);
            };
            img.onerror = () => {
                showToast("Nie udało się wczytać pliku obrazu.", "error");
                setIsProcessing(false);
            };
        };
        reader.onerror = () => {
            showToast("Błąd odczytu pliku.", "error");
            setIsProcessing(false);
        };
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    const handleSelectChange = (selectedOption) => {
        setFormData(prev => ({...prev, type: selectedOption.value}));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({...formData, calories: parseInt(formData.calories) || 0});
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between items-center">
                        <h2 className={typographyStyles.h2}>{initialData ? 'Edytuj karmę' : 'Dodaj nową karmę'}</h2>
                        <button type="button" onClick={onCancel}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Zdjęcie karmy</label>
                        <div className="mt-1 flex items-center gap-4">
                            <div
                                className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {formData.photoURL ? (
                                    <img src={formData.photoURL} alt="Podgląd"
                                         className="w-full h-full object-cover rounded-lg"/>
                                ) : (
                                    <LucideCat className="w-8 h-8 text-gray-400"/>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef}
                                   className="hidden"/>
                            {/* Zastosowanie ujednoliconego stylu dla przycisku */}
                            <button type="button" onClick={() => fileInputRef.current.click()}
                                    className={`${formStyles.buttonSecondary} w-auto text-sm`}>
                                {isProcessing ? 'Przetwarzam...' : 'Wybierz zdjęcie'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Nazwa karmy</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                               className={formStyles.input} required/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Kaloryczność (kcal / 100g)</label>
                        <input type="number" name="calories" value={formData.calories} onChange={handleChange}
                               className={formStyles.input} required/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Typ karmy</label>
                        <Select name="type" options={foodTypeOptions}
                                value={foodTypeOptions.find(o => o.value === formData.type)}
                                onChange={handleSelectChange} styles={customStyles} className="mt-1"/>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className={formStyles.buttonCancel}>Anuluj</button>
                        <button type="submit" disabled={isProcessing}
                                className={formStyles.buttonSubmit}>{initialData ? 'Zapisz zmiany' : 'Dodaj karmę'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodFormModal;