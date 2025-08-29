// /src/components/dashboard/WeightTracker.js

import React, {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {weightSchema} from '../../schemas/weightSchema';
import {collection, query, onSnapshot, doc, setDoc, updateDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków z Context API
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';

// Importy do stylów i wizualizacji
import {formStyles, typographyStyles} from '../../utils/formStyles';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {LucideLineChart, LucideChevronDown} from 'lucide-react';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const WeightTracker = ({catId, collapsible}) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const {user} = useAuth();
    const {showToast} = useAppContext();

    // Stany lokalne
    const [weightLog, setWeightLog] = useState([]);

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(weightSchema),
    });

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

    const handleAddWeight = async (data) => {
        const newWeight = parseFloat(data.newWeight);
        try {
            await setDoc(doc(collection(db, catsPath, catId, 'weightLog')), {
                weight: newWeight,
                date: new Date()
            });

            await updateDoc(doc(db, catsPath, catId), {
                currentWeight: newWeight
            });
            showToast("Waga została zaktualizowana.");
            reset({newWeight: ''}); // Czyści formularz po zapisie
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
                <h2 className={typographyStyles.h2}>
                    <LucideLineChart className="mr-2 h-6 w-6 text-indigo-500"/> Historia wagi
                </h2>
                <LucideChevronDown
                    className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${collapsible.isOpen ? 'rotate-180' : ''}`}/>
            </div>
            <div {...collapsible.contentProps}>
                <div className="overflow-hidden">
                    <div className="pt-4">
                        <div style={{height: '200px'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedData} margin={{top: 5, right: 20, left: -10, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                    <XAxis dataKey="date" fontSize={12} tick={{fill: '#6b7280'}}/>
                                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} unit="kg" fontSize={12}
                                           tick={{fill: '#6b7280'}}/>
                                    <Tooltip contentStyle={{
                                        backgroundColor: '#1f2937',
                                        color: '#e5e7eb',
                                        border: 'none',
                                        borderRadius: '0.5rem'
                                    }}/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="waga" stroke="#8884d8" strokeWidth={2}
                                          activeDot={{r: 8}}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <form onSubmit={handleSubmit(handleAddWeight)}
                              className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row">
                            <div className="flex-grow">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Nowa waga (kg)"
                                    className={formStyles.input}
                                    {...register("newWeight")}
                                />
                                <FormError message={errors.newWeight?.message}/>
                            </div>
                            <button type="submit"
                                    className={`${formStyles.buttonSubmit} w-full sm:w-auto text-sm`}>Zapisz
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeightTracker;