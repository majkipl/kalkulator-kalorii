import React, {useState, useEffect} from 'react';
import {doc, getDoc, updateDoc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';
import useCollapsible from '../../hooks/useCollapsible';

// Importy hooków z Context API
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';

// Importy ikon
import {
    LucideNotebookText, LucideChevronDown, LucideDroplets, LucidePill, LucideTag, LucideClipboardEdit
} from 'lucide-react';

import {formStyles} from '../../utils/formStyles';

const DailyHealthLog = ({catId, currentDate, initialData}) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const {user} = useAuth();
    const {showToast} = useAppContext();

    // Stany lokalne i hooki (bez zmian)
    const [healthData, setHealthData] = useState(initialData);
    const [isEditing, setIsEditing] = useState(false);
    const collapsible = useCollapsible();

    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        setHealthData(initialData);
    }, [initialData]);

    const handleSave = async () => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        try {
            const dataToSave = {
                note: healthData.note || '',
                waterIntake: Number(healthData.waterIntake) || 0,
                medications: healthData.medications || '',
                symptomTags: healthData.symptomTags || []
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

    const handleTagToggle = (tag) => {
        const newTags = healthData.symptomTags.includes(tag)
            ? healthData.symptomTags.filter(t => t !== tag)
            : [...healthData.symptomTags, tag];
        setHealthData(prev => ({...prev, symptomTags: newTags}));
    };

    const symptomOptions = ["wymioty", "biegunka", "apatia", "brak apetytu", "kaszel", "kichanie"];

    // Widok, gdy nie edytujemy
    if (!isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div {...collapsible.triggerProps}>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                        <LucideNotebookText className="mr-2 h-6 w-6 text-indigo-500"/> Dziennik Zdrowia</h2>
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
                            <p><strong className="flex items-center"><LucideDroplets size={16} className="mr-2"/>Spożycie
                                wody:</strong> {healthData.waterIntake || '0'} ml</p>
                            <p><strong className="flex items-center"><LucidePill size={16} className="mr-2"/>Leki/Suplementy:</strong> {healthData.medications || 'Brak'}
                            </p>
                            <p><strong className="flex items-center"><LucideTag size={16}
                                                                                className="mr-2"/>Objawy:</strong> {healthData.symptomTags.length > 0 ? healthData.symptomTags.join(', ') : 'Brak'}
                            </p>
                            <p><strong className="flex items-center"><LucideNotebookText size={16} className="mr-2"/>Notatki:</strong> {healthData.note || 'Brak'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <LucideNotebookText className="mr-2 h-6 w-6 text-indigo-500"/> Edytuj Dziennik Zdrowia</h2>
            <div className="space-y-4">
                <div>
                    <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucideDroplets
                        size={16} className="mr-2"/>Spożycie wody (ml)</label>
                    <input type="number" value={healthData.waterIntake}
                           onChange={(e) => setHealthData(p => ({...p, waterIntake: e.target.value}))}
                           className={formStyles.input}/>
                </div>
                <div>
                    <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucidePill
                        size={16} className="mr-2"/>Leki / Suplementy</label>
                    {/* ===== POPRAWIONA LINIA PONIŻEJ ===== */}
                    <textarea value={healthData.medications}
                              onChange={(e) => setHealthData(p => ({...p, medications: e.target.value}))}
                              className={`${formStyles.textarea} h-16`}/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucideTag
                        size={16} className="mr-2"/>Obserwowane objawy</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {symptomOptions.map(tag => (
                            <button key={tag} onClick={() => handleTagToggle(tag)}
                                    className={`px-2 py-1 text-xs rounded-full ${healthData.symptomTags.includes(tag) ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucideNotebookText
                        size={16} className="mr-2"/>Notatki ogólne</label>
                    <textarea value={healthData.note}
                              onChange={(e) => setHealthData(p => ({...p, note: e.target.value}))}
                              className={`${formStyles.textarea} h-20`}/>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsEditing(false)}
                            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Anuluj
                    </button>
                    <button onClick={handleSave}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Zapisz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyHealthLog;