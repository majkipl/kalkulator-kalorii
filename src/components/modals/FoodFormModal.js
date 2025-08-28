import React, {useState, useRef} from 'react';
import Select from 'react-select';
import {LucideX, LucideCat} from 'lucide-react';
import {getCustomSelectStyles} from '../../utils/formStyles';
import {useAppContext} from '../../context/AppContext';

const FoodFormModal = ({onSave, onCancel, initialData}) => {
    const {theme, showToast} = useAppContext();

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || 'mokra',
        calories: initialData?.calories || '',
        photoURL: initialData?.photoURL || ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const inputClassName = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";
    const foodTypeOptions = [{value: 'mokra', label: 'Mokra'}, {value: 'sucha', label: 'Sucha'}];
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const customStyles = getCustomSelectStyles(isDark);

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
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{initialData ? 'Edytuj karmę' : 'Dodaj nową karmę'}</h2>
                        <button type="button" onClick={onCancel}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Zdjęcie karmy</label>
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
                            <button type="button" onClick={() => fileInputRef.current.click()}
                                    className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg text-sm">
                                {isProcessing ? 'Przetwarzam...' : 'Wybierz zdjęcie'}
                            </button>
                        </div>
                    </div>

                    <div><label className="block text-sm font-medium">Nazwa karmy</label><input type="text" name="name"
                                                                                                value={formData.name}
                                                                                                onChange={handleChange}
                                                                                                className={inputClassName}
                                                                                                required/></div>
                    <div><label className="block text-sm font-medium">Kaloryczność (kcal / 100g)</label><input
                        type="number" name="calories" value={formData.calories} onChange={handleChange}
                        className={inputClassName} required/></div>
                    <div><label className="block text-sm font-medium">Typ karmy</label><Select name="type"
                                                                                               options={foodTypeOptions}
                                                                                               value={foodTypeOptions.find(o => o.value === formData.type)}
                                                                                               onChange={handleSelectChange}
                                                                                               styles={customStyles}
                                                                                               className="mt-1"/></div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel}
                                className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj
                        </button>
                        <button type="submit" disabled={isProcessing}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50">{initialData ? 'Zapisz zmiany' : 'Dodaj karmę'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodFormModal;