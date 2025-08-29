// /src/components/CatProfileForm.js

import React, {useState, useRef, useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {catProfileSchema} from '../schemas/catProfileSchema';
import Select from 'react-select';
import {LucideSave, LucideTrash2} from 'lucide-react';

// Importy z projektu
import {useAppContext} from '../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../utils/formStyles';
import {
    breedOptions,
    activityLevelOptions,
    physiologicalStateOptions,
    chronicDiseaseOptions
} from '../config/options';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const CatProfileForm = ({cat, onSave, onCancel, onDeleteRequest}) => {
    const {isDark} = useAppContext();

    // 1. Tworzymy referencję do pierwszego pola formularza
    const firstInputRef = useRef(null);

    const {register, handleSubmit, control, formState: {errors}, reset} = useForm({
        resolver: zodResolver(catProfileSchema),
        defaultValues: {
            name: cat?.name || '',
            currentWeight: cat?.currentWeight || '',
            targetWeight: cat?.targetWeight || '',
            isNeutered: cat?.isNeutered || false,
            breed: cat?.breed || 'mieszany',
            activityLevel: cat?.activityLevel || 'umiarkowany',
            physiologicalState: cat?.physiologicalState || 'normalny',
            chronicDisease: cat?.chronicDisease || 'brak',
            years: cat ? Math.floor(cat.age) : 1,
            months: cat ? Math.round((cat.age - Math.floor(cat.age)) * 12) : 0,
        }
    });

    // 2. Efekt, który ustawi focus na pierwszym polu, gdy formularz jest w trybie tworzenia nowego kota
    useEffect(() => {
        // Sprawdzamy, czy `cat` nie istnieje (tryb tworzenia)
        if (!cat && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current.focus();
            }, 100);
        }
    }, [cat]); // Efekt uruchomi się, gdy zmieni się prop `cat`

    useEffect(() => {
        if (cat) {
            reset({
                name: cat.name,
                currentWeight: cat.currentWeight,
                targetWeight: cat.targetWeight,
                isNeutered: cat.isNeutered,
                breed: cat.breed,
                activityLevel: cat.activityLevel,
                physiologicalState: cat.physiologicalState,
                chronicDisease: cat.chronicDisease,
                years: Math.floor(cat.age),
                months: Math.round((cat.age - Math.floor(cat.age)) * 12),
            });
        }
    }, [cat, reset]);

    const customSelectStyles = getCustomSelectStyles(isDark);

    const processSubmit = (data) => {
        const finalAge = parseInt(data.years, 10) + (parseInt(data.months, 10) / 12);

        const dataToSave = {
            name: data.name,
            currentWeight: parseFloat(data.currentWeight) || 0,
            targetWeight: parseFloat(data.targetWeight) || 0,
            isNeutered: data.isNeutered,
            activityLevel: data.activityLevel,
            physiologicalState: data.physiologicalState,
            chronicDisease: data.chronicDisease,
            breed: data.breed,
            age: finalAge,
        };
        onSave(dataToSave);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
            <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
                <h2 className={`${typographyStyles.h2} mb-4`}>{cat ? 'Edytuj profil' : 'Stwórz nowy profil'}</h2>

                <div>
                    <label className={typographyStyles.label}>Nazwa kota</label>
                    <input
                        type="text"
                        {...register("name")}
                        className={formStyles.input}
                        ref={firstInputRef} // 3. Dowiązujemy ref
                        aria-invalid={errors.name ? "true" : "false"}
                    />
                    <FormError message={errors.name?.message}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={typographyStyles.label}>Aktualna waga (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("currentWeight")}
                            className={formStyles.input}
                            aria-invalid={errors.currentWeight ? "true" : "false"}
                        />
                        <FormError message={errors.currentWeight?.message}/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Docelowa waga (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("targetWeight")}
                            className={formStyles.input}
                            placeholder="Opcjonalnie"
                            aria-invalid={errors.targetWeight ? "true" : "false"}
                        />
                        <FormError message={errors.targetWeight?.message}/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={typographyStyles.label}>Wiek (lata)</label>
                        <input
                            type="number"
                            {...register("years")}
                            className={formStyles.input}
                            aria-invalid={errors.years ? "true" : "false"}
                        />
                        <FormError message={errors.years?.message}/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Miesiące</label>
                        <input
                            type="number"
                            {...register("months")}
                            className={formStyles.input}
                            aria-invalid={errors.months ? "true" : "false"}
                        />
                        <FormError message={errors.months?.message}/>
                    </div>
                </div>

                <div>
                    <label className={typographyStyles.label}>Rasa</label>
                    <Controller
                        name="breed"
                        control={control}
                        render={({field}) => (
                            <Select
                                {...field}
                                options={breedOptions}
                                value={breedOptions.find(o => o.value === field.value)}
                                onChange={val => field.onChange(val.value)}
                                styles={customSelectStyles}
                                className="mt-1"
                                aria-invalid={errors.breed ? "true" : "false"}
                            />
                        )}
                    />
                    <FormError message={errors.breed?.message}/>
                </div>

                <div>
                    <label className={typographyStyles.label}>Poziom aktywności</label>
                    <Controller
                        name="activityLevel"
                        control={control}
                        render={({field}) => (
                            <Select
                                {...field}
                                options={activityLevelOptions}
                                value={activityLevelOptions.find(o => o.value === field.value)}
                                onChange={val => field.onChange(val.value)}
                                styles={customSelectStyles}
                                className="mt-1"
                                aria-invalid={errors.activityLevel ? "true" : "false"}
                            />
                        )}
                    />
                    <FormError message={errors.activityLevel?.message}/>
                </div>

                <div>
                    <label className={typographyStyles.label}>Stan fizjologiczny</label>
                    <Controller
                        name="physiologicalState"
                        control={control}
                        render={({field}) => (
                            <Select
                                {...field}
                                options={physiologicalStateOptions}
                                value={physiologicalStateOptions.find(o => o.value === field.value)}
                                onChange={val => field.onChange(val.value)}
                                styles={customSelectStyles}
                                className="mt-1"
                                aria-invalid={errors.physiologicalState ? "true" : "false"}
                            />
                        )}
                    />
                    <FormError message={errors.physiologicalState?.message}/>
                </div>

                <div>
                    <label className={typographyStyles.label}>Choroba przewlekła</label>
                    <Controller
                        name="chronicDisease"
                        control={control}
                        render={({field}) => (
                            <Select
                                {...field}
                                options={chronicDiseaseOptions}
                                value={chronicDiseaseOptions.find(o => o.value === field.value)}
                                onChange={val => field.onChange(val.value)}
                                styles={customSelectStyles}
                                className="mt-1"
                                aria-invalid={errors.chronicDisease ? "true" : "false"}
                            />
                        )}
                    />
                    <FormError message={errors.chronicDisease?.message}/>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="isNeutered" {...register("isNeutered")} className={formStyles.checkbox}/>
                    <label htmlFor="isNeutered" className={`${typographyStyles.label} ml-2 font-normal`}>Kot
                        sterylizowany/kastrowany</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onCancel} className={formStyles.buttonCancel}>Anuluj</button>
                    <button type="submit" className={formStyles.buttonSubmit}>
                        <LucideSave className="mr-2 h-4 w-4"/> Zapisz
                    </button>
                </div>
            </form>

            {onDeleteRequest && (
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                    <button type="button" onClick={onDeleteRequest} className={formStyles.buttonDestructive}>
                        <LucideTrash2 className="mr-2 h-4 w-4"/> Usuń Profil Kota
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatProfileForm;