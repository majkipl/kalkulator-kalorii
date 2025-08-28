// /src/components/modals/MealFormModal.js

import React, {useState, useMemo} from 'react';
import Select from 'react-select';

// Importy hooków i stylów
import {useAppContext} from '../../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../../utils/formStyles';

const MealFormModal = ({foods, onSave, onCancel, initialData}) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const {theme, isDark} = useAppContext();

    // Stany lokalne
    const [selectedFoodId, setSelectedFoodId] = useState(initialData?.foodId || '');
    const [weight, setWeight] = useState(initialData?.weight || '');

    // Style dla react-select
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
        const mealData = {
            foodId: food.id,
            foodName: food.name,
            foodType: food.type,
            weight: parseFloat(weight),
            calories: calories
        };
        onSave(mealData);
    };

    const handleSelectChange = (selectedOption) => {
        setSelectedFoodId(selectedOption ? selectedOption.value : '');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                    <h2 className={typographyStyles.h2}>Edytuj posiłek</h2>
                    <div>
                        <label className={typographyStyles.label}>Karma</label>
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
                        <label className={typographyStyles.label}>Ilość (g)</label>
                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                               className={formStyles.input} required/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className={formStyles.buttonCancel}>Anuluj</button>
                        <button type="submit" className={formStyles.buttonSubmit}>Zapisz zmiany</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealFormModal;