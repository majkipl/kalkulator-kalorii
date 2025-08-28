// /src/components/modals/ExportModal.js

import React, {useState} from 'react';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków i stylów
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles} from '../../utils/formStyles';

const ExportModal = ({catId, onCancel}) => {
    // Pobieramy dane globalne
    const {user} = useAuth();
    const {showToast} = useAppContext();

    // Stany lokalne
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const catsPath = userCatsCollectionPath(user.uid);

    const handleExport = async () => {
        try {
            let allMeals = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split('T')[0];
                const mealDocRef = doc(db, catsPath, catId, 'meals', dateString);
                const mealDoc = await getDoc(mealDocRef);
                if (mealDoc.exists()) {
                    const dailyMeals = mealDoc.data().meals.map(meal => ({...meal, date: dateString}));
                    allMeals.push(...dailyMeals);
                }
            }

            if (allMeals.length === 0) {
                showToast("Brak danych do eksportu w wybranym okresie.", "error");
                return;
            }

            const headers = "Data,Nazwa Karmy,Typ,Waga (g),Kalorie (kcal)\n";
            const csvContent = allMeals.map(m =>
                `${m.date},"${m.foodName}",${m.foodType},${m.weight},${Math.round(m.calories)}`
            ).join("\n");

            const blob = new Blob([headers + csvContent], {type: 'text/csv;charset=utf-8;'});
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `eksport_zywienia_${catId}_${startDate}_${endDate}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            showToast("Eksport zakończony pomyślnie.");
            onCancel();

        } catch (error) {
            showToast("Wystąpił błąd podczas eksportu.", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <h2 className={`${typographyStyles.h2} mb-4`}>Eksportuj dane żywieniowe</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className={typographyStyles.label}>Data początkowa</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                               className={formStyles.input}/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Data końcowa</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                               className={formStyles.input}/>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                    <button onClick={onCancel} className={formStyles.buttonCancel}>Anuluj</button>
                    <button onClick={handleExport} className={formStyles.buttonSubmit}>Eksportuj</button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;