import React, {useRef, useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {catProfileSchema} from '../schemas/catProfileSchema';
import Select from 'react-select';
import {LucideSave, LucideTrash2} from 'lucide-react';
import {useAppContext} from '../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../utils/formStyles';
import {
    breedOptions,
    activityLevelOptions,
    physiologicalStateOptions,
    chronicDiseaseOptions
} from '../config/options';
import FormError from '../shared/FormError';

const CatProfileForm = ({cat, onSubmit, onCancel, onDeleteRequest}) => {
    const {isDark} = useAppContext();
    const firstInputRef = useRef(null);

    const {register, handleSubmit, control, formState: {errors}, reset, watch} = useForm({
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

    const yearsValue = watch("years");
    const {ref: nameRef, ...nameRest} = register("name");

    useEffect(() => {
        if (!cat && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current.focus();
            }, 100);
        }
    }, [cat]);

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

    const processAndSubmit = async (data) => {
        const finalAge = (data.years || 0) + ((data.months || 0) / 12);
        const dataToSave = {
            ...data,
            age: finalAge,
            currentWeight: Number(data.currentWeight),
            targetWeight: data.targetWeight ? Number(data.targetWeight) : Number(data.currentWeight)
        };

        const success = await onSubmit(dataToSave);

        if (success) {
            onCancel();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
            <form onSubmit={handleSubmit(processAndSubmit)} className="space-y-4">
                <h2 className={`${typographyStyles.h2} mb-4`}>{cat ? 'Edytuj profil' : 'Stwórz nowy profil'}</h2>

                <div>
                    <label className={typographyStyles.label}>Nazwa kota</label>
                    <input
                        type="text"
                        {...nameRest}
                        ref={(e) => {
                            nameRef(e);
                            firstInputRef.current = e;
                        }}
                        className={formStyles.input}
                        aria-invalid={!!errors.name}
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
                            aria-invalid={!!errors.currentWeight}
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
                            aria-invalid={!!errors.targetWeight}
                        />
                        <FormError message={errors.targetWeight?.message}/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={typographyStyles.label}>Wiek (lata)</label>
                        <input
                            type="number"
                            {...register("years")}
                            className={formStyles.input}
                            aria-invalid={!!errors.years}
                        />
                        <FormError message={errors.years?.message}/>
                    </div>

                    {Number(yearsValue) === 0 && (
                        <div>
                            <label className={typographyStyles.label}>Miesiące</label>
                            <input
                                type="number"
                                {...register("months")}
                                className={formStyles.input}
                                aria-invalid={!!errors.months}
                            />
                            <FormError message={errors.months?.message}/>
                        </div>
                    )}
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
                                aria-invalid={!!errors.breed}
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
                                aria-invalid={!!errors.activityLevel}
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
                                aria-invalid={!!errors.physiologicalState}
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
                                aria-invalid={!!errors.chronicDisease}
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
                    <button
                        type="submit"
                        className={formStyles.buttonSubmit}
                        data-cy="profile-save-button"
                    >
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