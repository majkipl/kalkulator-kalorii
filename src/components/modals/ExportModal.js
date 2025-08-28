import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { userCatsCollectionPath } from '../../firebase/paths';

// Importy hooków z Context API
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

const ExportModal = ({ catId, onCancel }) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const { user } = useAuth();
    const { showToast } = useAppContext();

    // Stany lokalne (bez zmian)
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    // Teraz `user` jest dostępny z kontekstu, więc `user.uid` będzie działać
    const catsPath = userCatsCollectionPath(user.uid);
    const inputClassName = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";

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
                    const dailyMeals = mealDoc.data().meals.map(meal => ({ ...meal, date: dateString }));
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

            const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Eksportuj dane żywieniowe</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block text-sm font-medium">Data początkowa</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClassName} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Data końcowa</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClassName} />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                    <button onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Anuluj</button>
                    <button onClick={handleExport} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Eksportuj</button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;