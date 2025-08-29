// /src/components/modals/MealFormModal.js

import React, {useMemo, useEffect, useRef} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {mealSchema} from '../../schemas/mealSchema';
import Select from 'react-select';

// Importy hooków i stylów
import {useAppContext} from '../../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../../utils/formStyles';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const MealFormModal = ({foods, onSave, onCancel, initialData}) => {
    const {isDark} = useAppContext();

    // 1. Tworzymy referencję do pola Select (w tym przypadku do jego wrappera)
    const selectRef = useRef(null);

    const foodOptions = useMemo(() =>
            foods.map(food => ({
                value: food.id,
                label: food.name,
                calories: food.calories
            })),
        [foods]
    );

    const {register, handleSubmit, control, formState: {errors}, reset} = useForm({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            // Znajdujemy cały obiekt opcji, ponieważ react-hook-form tego potrzebuje dla `Controller`a
            food: foodOptions.find(f => f.value === initialData?.foodId) || null,
            weight: initialData?.weight || '',
        }
    });

    // 2. Efekt, który ustawi focus, gdy komponent się zamontuje
    useEffect(() => {
        setTimeout(() => {
            selectRef.current?.focus();
        }, 100);
    }, []);

    const customSelectStyles = getCustomSelectStyles(isDark);

    const processSubmit = (data) => {
        const selectedFood = foods.find(f => f.id === data.food.value);
        if (!selectedFood) return;

        const weight = parseFloat(data.weight);
        const calories = (weight / 100) * selectedFood.calories;

        const mealData = {
            foodId: selectedFood.id,
            foodName: selectedFood.name,
            foodType: selectedFood.type,
            weight: weight,
            calories: calories,
        };
        onSave(mealData);
        reset();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
                    <h2 className={typographyStyles.h2}>Edytuj posiłek</h2>
                    <div>
                        <label className={typographyStyles.label}>Karma</label>
                        <Controller
                            name="food"
                            control={control}
                            render={({field}) => (
                                <Select
                                    ref={selectRef} // 3. Dowiązujemy ref
                                    {...field}
                                    options={foodOptions}
                                    styles={customSelectStyles}
                                    className="mt-1"
                                    aria-invalid={errors.food ? "true" : "false"}
                                />
                            )}
                        />
                        <FormError message={errors.food?.message || errors.food?.value?.message}/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Ilość (g)</label>
                        <input
                            type="number"
                            className={formStyles.input}
                            {...register("weight")}
                            aria-invalid={errors.weight ? "true" : "false"}
                        />
                        <FormError message={errors.weight?.message}/>
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