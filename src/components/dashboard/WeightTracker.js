import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { userCatsCollectionPath } from '../../firebase/paths';

// Importy hooków z Context API
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

// Importy bibliotek i ikon
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LucideLineChart, LucideChevronDown } from 'lucide-react';

const WeightTracker = ({ catId, collapsible }) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const { user } = useAuth();
    const { showToast } = useAppContext();

    // Stany lokalne (bez zmian)
    const [weightLog, setWeightLog] = useState([]);
    const [newWeight, setNewWeight] = useState('');

    // Teraz `user` jest dostępny z kontekstu, więc `user.uid` będzie działać
    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        const logCollection = collection(db, catsPath, catId, 'weightLog');
        const q = query(logCollection);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(),
                date: doc.data().date.toDate()
            })).sort((a, b) => a.date - b.date);
            setWeightLog(data);
        });

        return () => unsubscribe();
    }, [catId, catsPath]);

    const handleAddWeight = async (e) => {
        e.preventDefault();
        if (!newWeight || parseFloat(newWeight) <= 0) {
            showToast("Proszę podać prawidłową wagę.", "error");
            return;
        }

        try {
            await setDoc(doc(collection(db, catsPath, catId, 'weightLog')), {
                weight: parseFloat(newWeight),
                date: new Date()
            });

            await updateDoc(doc(db, catsPath, catId), {
                currentWeight: parseFloat(newWeight)
            });
            showToast("Waga została zaktualizowana.");
            setNewWeight('');
        } catch (error) {
            showToast("Błąd zapisu wagi.", "error");
        }
    };

    const formattedData = weightLog.map(log => ({
        date: log.date.toLocaleDateString('pl-PL'),
        waga: log.weight
    }));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div {...collapsible.triggerProps}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    <LucideLineChart className="mr-2 h-6 w-6 text-indigo-500"/> Historia wagi
                </h2>
                <LucideChevronDown className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${collapsible.isOpen ? 'rotate-180' : ''}`} />
            </div>
            <div {...collapsible.contentProps}>
                <div className="overflow-hidden">
                    <div className="pt-4">
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="date" fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} unit="kg" fontSize={12} tick={{ fill: '#6b7280' }}/>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#e5e7eb', border: 'none', borderRadius: '0.5rem' }}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="waga" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <form onSubmit={handleAddWeight} className="mt-4 flex items-center gap-2">
                            <input
                                type="number"
                                step="0.01"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                placeholder="Nowa waga (kg)"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                            />
                            <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm">Zapisz</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeightTracker;