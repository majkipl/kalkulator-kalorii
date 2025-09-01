// /src/components/dashboard/DailyHealthLog.js

import React, {useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {healthLogSchema} from '../../schemas/healthLogSchema';
import {doc, getDoc, updateDoc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków, stylów i ikon
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles} from '../../utils/formStyles';
import {LucideDroplets, LucidePill, LucideTag, LucideNotebookText} from 'lucide-react';
import FormError from '../../shared/FormError';

const DailyHealthLog = ({catId, currentDate, isEditing, setIsEditing, initialData}) => {
    const {user} = useAuth();
    const {showToast} = useAppContext();
    const catsPath = userCatsCollectionPath(user.uid);

    const {register, handleSubmit, control, formState: {errors}, reset, watch} = useForm({
        resolver: zodResolver(healthLogSchema),
        defaultValues: initialData
    });

    // Resetowanie formularza, gdy dane się zmieniają (np. przy zmianie dnia)
    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const healthData = watch();

    const handleSave = async (data) => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        try {
            const dataToSave = {
                note: data.note || '',
                waterIntake: Number(data.waterIntake) || 0,
                medications: data.medications || '',
                symptomTags: data.symptomTags || []
            };
            const docSnap = await getDoc(mealDocRef);
            if (docSnap.exists()) {
                await updateDoc(mealDocRef, dataToSave);
            } else {
                // Jeśli dokument dnia nie istnieje, tworzymy go z pustą listą posiłków
                await setDoc(mealDocRef, {...dataToSave, meals: [], der: 0});
            }
            showToast("Dziennik zdrowia został zapisany.");
            setIsEditing(false);
        } catch (error) {
            showToast("Błąd zapisu dziennika zdrowia.", "error");
        }
    };

    const symptomOptions = ["wymioty", "biegunka", "apatia", "brak apetytu", "kaszel", "kichanie"];

    // Widok, gdy nie edytujemy
    if (!isEditing) {
        return (
            <div className="pt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p><strong className={typographyStyles.label}><LucideDroplets size={16} className="mr-2"/>Spożycie wody:</strong> {healthData.waterIntake || '0'} ml
                </p>
                <p><strong className={typographyStyles.label}><LucidePill size={16}
                                                                          className="mr-2"/>Leki/Suplementy:</strong> {healthData.medications || 'Brak'}
                </p>
                <p><strong className={typographyStyles.label}><LucideTag size={16}
                                                                         className="mr-2"/>Objawy:</strong> {healthData.symptomTags.length > 0 ? healthData.symptomTags.join(', ') : 'Brak'}
                </p>
                <p><strong className={typographyStyles.label}><LucideNotebookText size={16}
                                                                                  className="mr-2"/>Notatki:</strong> {healthData.note || 'Brak'}
                </p>
            </div>
        );
    }

    // Widok formularza edycji
    return (
        <form onSubmit={handleSubmit(handleSave)} className="pt-4">
            <div className="space-y-4">
                <div>
                    <label className={`${typographyStyles.label} flex items-center`}><LucideDroplets size={16}
                                                                                                     className="mr-2"/>Spożycie
                        wody (ml)</label>
                    <input type="number" {...register("waterIntake")} className={formStyles.input}
                           aria-invalid={!!errors.waterIntake}/>
                    <FormError message={errors.waterIntake?.message}/>
                </div>
                <div>
                    <label className={`${typographyStyles.label} flex items-center`}><LucidePill size={16}
                                                                                                 className="mr-2"/>Leki
                        / Suplementy</label>
                    <textarea {...register("medications")} className={`${formStyles.textarea} h-16`}
                              aria-invalid={!!errors.medications}/>
                    <FormError message={errors.medications?.message}/>
                </div>
                <div>
                    <label className={`${typographyStyles.label} flex items-center`}><LucideTag size={16}
                                                                                                className="mr-2"/>Obserwowane
                        objawy</label>
                    <Controller
                        name="symptomTags"
                        control={control}
                        render={({field}) => (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {symptomOptions.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            const newTags = field.value.includes(tag)
                                                ? field.value.filter(t => t !== tag)
                                                : [...field.value, tag];
                                            field.onChange(newTags);
                                        }}
                                        className={`px-2 py-1 text-xs rounded-full ${field.value.includes(tag) ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                </div>
                <div>
                    <label className={`${typographyStyles.label} flex items-center`}><LucideNotebookText size={16}
                                                                                                         className="mr-2"/>Notatki
                        ogólne</label>
                    <textarea {...register("note")} className={`${formStyles.textarea} h-20`}
                              aria-invalid={!!errors.note}/>
                    <FormError message={errors.note?.message}/>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setIsEditing(false)}
                            className={formStyles.buttonCancel}>Anuluj
                    </button>
                    <button type="submit" className={formStyles.buttonSubmit}>Zapisz</button>
                </div>
            </div>
        </form>
    );
};

export default DailyHealthLog;