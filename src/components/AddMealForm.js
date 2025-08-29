// /src/components/AddMealForm.js

import React, {useMemo} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {mealSchema} from '../schemas/mealSchema';
import Select from 'react-select';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-subtle.css';

// Importy z projektu
import {useAppContext} from '../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../utils/formStyles';
import {LucidePlusCircle, LucideBone} from 'lucide-react';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const AddMealForm = ({foods, onSave}) => {
    const {isDark} = useAppContext();

    const {register, handleSubmit, control, formState: {errors}, reset} = useForm({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            food: null,
            weight: '',
        }
    });

    const customSelectStyles = getCustomSelectStyles(isDark);

    const foodOptions = useMemo(() =>
            foods.map(food => ({
                value: food.id,
                label: food.name,
                // Dodatkowe dane, które możemy wykorzystać
                calories: food.calories,
                photoURL: food.photoURL || null,
            })),
        [foods]
    );

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
        reset(); // Czyści formularz po poprawnym dodaniu
    };

    // Komponenty niestandardowe dla react-select (bez zmian)
    const CustomOption = ({innerProps, label, data}) => {
        const content = (
            <div
                className={`flex items-center p-2 cursor-pointer ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                <div
                    className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                    {data.photoURL ?
                        <img src={data.photoURL} alt={label} className="w-full h-full object-cover rounded-md"/> :
                        <LucideBone className="w-5 h-5 text-gray-400"/>}
                </div>
                <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{data.calories} kcal/100g</div>
                </div>
            </div>
        );
        return data.photoURL ? <Tippy content={<img src={data.photoURL} alt={`Powiększenie ${label}`}
                                                    className="w-36 h-36 object-contain rounded-md"/>} placement="left"
                                      animation="scale-subtle" delay={[200, 0]}>
            <div {...innerProps}>{content}</div>
        </Tippy> : <div {...innerProps}>{content}</div>;
    };

    const CustomSingleValue = ({children, ...props}) => {
        const {data} = props;
        const content = (
            <div className="flex items-center">
                <div
                    className="w-6 h-6 mr-2 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                    {data.photoURL ?
                        <img src={data.photoURL} alt={children} className="w-full h-full object-cover rounded-md"/> :
                        <LucideBone className="w-4 h-4 text-gray-400"/>}
                </div>
                <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{children}</span>
            </div>
        );
        return data.photoURL ? <Tippy content={<img src={data.photoURL} alt={`Powiększenie ${children}`}
                                                    className="w-36 h-36 object-contain rounded-md"/>} placement="top"
                                      animation="scale-subtle" delay={[100, 0]}>{content}</Tippy> : content;
    };

    return (
        <form onSubmit={handleSubmit(processSubmit)}
              className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                    <label className={typographyStyles.label}>Wybierz karmę</label>
                    <Controller
                        name="food"
                        control={control}
                        render={({field}) => (
                            <Select
                                {...field}
                                options={foodOptions}
                                styles={customSelectStyles}
                                placeholder="Wyszukaj lub wybierz karmę..."
                                isClearable
                                components={{Option: CustomOption, SingleValue: CustomSingleValue}}
                            />
                        )}
                    />
                    <FormError message={errors.food?.message || errors.food?.value?.message}/>
                </div>
                <div>
                    <label className={typographyStyles.label}>Ilość (g)</label>
                    <input
                        type="number"
                        step="1"
                        placeholder="np. 50"
                        {...register("weight")}
                        className={formStyles.input}
                    />
                    <FormError message={errors.weight?.message}/>
                </div>
            </div>
            <button type="submit" className={formStyles.buttonSuccess}>
                <LucidePlusCircle className="mr-2 h-5 w-5"/> Dodaj posiłek
            </button>
        </form>
    );
};

export default AddMealForm;