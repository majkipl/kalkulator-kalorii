// /src/components/dashboard/DailyHealthLog.js

import React, {useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {healthLogSchema} from '../../schemas/healthLogSchema';
import {doc, getDoc, updateDoc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków, komponentów i stylów
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import useCollapsible from '../../hooks/useCollapsible';
import {formStyles, typographyStyles} from '../../utils/formStyles';
import {
    LucideNotebookText, LucideChevronDown, LucideDroplets, LucidePill, LucideTag, LucideClipboardEdit
} from 'lucide-react';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const DailyHealthLog = ({catId, currentDate, initialData, isEditing, setIsEditing}) => {
    // Pobieramy dane globalne
    const {user} = useAuth();
    const {showToast} = useAppContext();

    const collapsible = useCollapsible();
    const catsPath = userCatsCollectionPath(user.uid);

    const {register, handleSubmit, control, formState: {errors}, reset, watch} = useForm({
        resolver: zodResolver(healthLogSchema),
        defaultValues: {
            waterIntake: initialData.waterIntake || '',
            medications: initialData.medications || '',
            symptomTags: initialData.symptomTags || [],
            note: initialData.note || '',
        }
    });

    // Obserwujemy dane, aby móc je wyświetlić w trybie tylko do odczytu
    const healthData = watch();

    // Resetowanie formularza, gdy zmieniają się dane początkowe (np. zmiana dnia)
    useEffect(() => {
        reset({
            waterIntake: initialData.waterIntake || '',
            medications: initialData.medications || '',
            symptomTags: initialData.symptomTags || [],
            note: initialData.note || '',
        });
    }, [initialData, reset]);


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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div {...collapsible.triggerProps}>
                    <h2 className={typographyStyles.h2}><LucideNotebookText
                        className="mr-2 h-6 w-6 text-indigo-500"/> Dziennik Zdrowia</h2>
                    <div className="flex items-center">
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <LucideClipboardEdit className="h-5 w-5"/>
                        </button>
                        <LucideChevronDown
                            className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${collapsible.isOpen ? 'rotate-180' : ''}`}/>
                    </div>
                </div>
                <div {...collapsible.contentProps}>
                    <div className="overflow-hidden">
                        <div className="pt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong className={typographyStyles.label}><LucideDroplets size={16} className="mr-2"/>Spożycie
                                wody:</strong> {healthData.waterIntake || '0'} ml</p>
                            <p><strong className={typographyStyles.label}><LucidePill size={16} className="mr-2"/>Leki/Suplementy:</strong> {healthData.medications || 'Brak'}
                            </p>
                            <p><strong className={typographyStyles.label}><LucideTag size={16} className="mr-2"/>Objawy:</strong> {healthData.symptomTags.length > 0 ? healthData.symptomTags.join(', ') : 'Brak'}
                            </p>
                            <p><strong className={typographyStyles.label}><LucideNotebookText size={16}
                                                                                              className="mr-2"/>Notatki:</strong> {healthData.note || 'Brak'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Widok formularza edycji
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit(handleSave)}>
                <h2 className={`${typographyStyles.h2} mb-4`}>Edytuj Dziennik Zdrowia</h2>
                <div className="space-y-4">
                    <div>
                        <label className={`${typographyStyles.label} flex items-center`}><LucideDroplets size={16}
                                                                                                         className="mr-2"/>Spożycie
                            wody (ml)</label>
                        <input type="number" {...register("waterIntake")} className={formStyles.input}/>
                        <FormError message={errors.waterIntake?.message}/>
                    </div>
                    <div>
                        <label className={`${typographyStyles.label} flex items-center`}><LucidePill size={16}
                                                                                                     className="mr-2"/>Leki
                            / Suplementy</label>
                        <textarea {...register("medications")} className={`${formStyles.textarea} h-16`}/>
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
                        <textarea {...register("note")} className={`${formStyles.textarea} h-20`}/>
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
        </div>
    );
};

export default DailyHealthLog;