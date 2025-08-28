// /src/components/modals/StatisticsModal.js

import React, {useState, useEffect} from 'react';
import {collection, doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków i komponentów
import {useAuth} from '../../context/AuthContext';
import Spinner from '../../shared/Spinner';
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {LucideX} from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-subtle.css';
import {typographyStyles} from "../../utils/formStyles";

const StatisticsModal = ({catId, onCancel}) => {
    // Pobieramy dane o użytkowniku bezpośrednio z kontekstu
    const {user} = useAuth();

    // Stany lokalne (bez zmian)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    // Teraz `user` jest dostępny z kontekstu, więc `user.uid` będzie działać
    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const mealsCol = collection(db, catsPath, catId, 'meals');
            const allMeals = [];
            let daysWithMeals = 0;

            for (let i = 0; i < timeRange; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                const mealDoc = await getDoc(doc(mealsCol, dateString));

                if (mealDoc.exists() && mealDoc.data().meals && mealDoc.data().meals.length > 0) {
                    allMeals.push(...mealDoc.data().meals);
                    daysWithMeals++;
                }
            }

            if (allMeals.length === 0) {
                setStats({avgCalories: 0, foodTypeDistribution: [], topFoods: []});
                setLoading(false);
                return;
            }

            const totalCalories = allMeals.reduce((sum, meal) => sum + meal.calories, 0);
            const avgCalories = daysWithMeals > 0 ? totalCalories / daysWithMeals : 0;

            const foodTypeDistribution = allMeals.reduce((acc, meal) => {
                const type = meal.foodType || 'nieznany';
                acc[type] = (acc[type] || 0) + meal.weight;
                return acc;
            }, {});

            const foodTypeData = Object.keys(foodTypeDistribution).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: foodTypeDistribution[key]
            }));

            const foodFrequency = allMeals.reduce((acc, meal) => {
                acc[meal.foodName] = (acc[meal.foodName] || 0) + 1;
                return acc;
            }, {});

            const topFoods = Object.entries(foodFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, count]) => ({name, count}));

            setStats({avgCalories, foodTypeDistribution: foodTypeData, topFoods});
            setLoading(false);
        };

        fetchStats();
    }, [catId, catsPath, timeRange]);

    const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];
    const timeRanges = [7, 14, 30, 90];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up flex flex-col"
                style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={typographyStyles.h2}>Statystyki z
                        ostatnich {timeRange} dni</h2>
                    <button type="button" onClick={onCancel}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                </div>

                <div className="flex justify-center mb-4 space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                    {timeRanges.map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-sm rounded-full transition ${
                                timeRange === range
                                    ? 'bg-indigo-500 text-white font-semibold'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                        >
                            {range} dni
                        </button>
                    ))}
                </div>

                {loading ? <Spinner/> : (
                    <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Średnie dzienne spożycie
                                <Tippy content="Obliczane tylko z dni, w których podano posiłek.">
                                    <span
                                        className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1 cursor-help">(?)</span>
                                </Tippy>
                            </h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(stats.avgCalories)}
                                <span className="text-lg font-normal">kcal</span></p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Najczęściej podawane
                                karmy</h3>
                            {stats.topFoods.length > 0 ? (
                                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                                    {stats.topFoods.map(food => (
                                        <li key={food.name} className="flex justify-between">
                                            <span>{food.name}</span>
                                            <span className="font-semibold">{food.count} razy</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500 dark:text-gray-400">Brak danych.</p>}
                        </div>
                        <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-center">Podział karm (wg
                                wagi)</h3>
                            {stats.foodTypeDistribution.length > 0 ? (
                                <div style={{height: '250px'}}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.foodTypeDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {stats.foodTypeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value.toFixed(1)}g`} contentStyle={{
                                                backgroundColor: '#1f2937',
                                                color: '#e5e7eb',
                                                border: 'none',
                                                borderRadius: '0.5rem'
                                            }}/>
                                            <Legend wrapperStyle={{color: '#e5e7eb'}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : <p className="text-sm text-center text-gray-500 dark:text-gray-400">Brak danych do
                                wyświetlenia wykresu.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsModal;