import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { getCustomSelectStyles } from '../../utils/formStyles';
import { useAppContext } from '../../context/AppContext';

const MealFormModal = ({ foods, onSave, onCancel, initialData }) => {
    const { theme } = useAppContext();
    const [selectedFoodId, setSelectedFoodId] = useState(initialData?.foodId || '');
    const [weight, setWeight] = useState(initialData?.weight || '');

    const inputClassName = "block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const customStyles = getCustomSelectStyles(isDark);

    const foodOptions = useMemo(() =>
            foods.map(food => ({
                value: food.id,
                label: food.name,
                calories: food.calories
            })),
        [foods]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFoodId || !weight) return;
        const food = foods.find(f => f.id === selectedFoodId);
        if (!food) return;
        const calories = (parseFloat(weight) / 100) * food.calories;
        const mealData = { foodId: food.id, foodName: food.name, foodType: food.type, weight: parseFloat(weight), calories: calories };
        onSave(mealData);
    };

    const handleSelectChange = (selectedOption) => {
        setSelectedFoodId(selectedOption ? selectedOption.value : '');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Edytuj posiłek</h2>
                    <div>
                        <label className="block text-sm font-medium">Karma</label>
                        <Select
                            className="mt-1"
                            styles={customStyles}
                            options={foodOptions}
                            value={foodOptions.find(o => o.value === selectedFoodId)}
                            onChange={handleSelectChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Ilość (g)</label>
                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClassName} required />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Anuluj</button>
                        <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Zapisz zmiany</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealFormModal;