// /src/components/dashboard/DashboardStats.js

import React, {useMemo} from 'react';
import {
    LucideBarChart3,
    LucideFlame,
    LucideBone,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideMinus,
    LucideChevronDown
} from 'lucide-react';
import {typographyStyles} from '../../utils/formStyles';
import Spinner from '../../shared/Spinner';

// Mały komponent pomocniczy do wyświetlania pojedynczej statystyki
const StatCard = ({icon, title, value, unit}) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {value} <span className="text-sm font-normal">{unit}</span>
            </p>
        </div>
    </div>
);

const DashboardStats = ({historicalMeals, historicalWeight, isLoading, collapsible}) => {
    // Obliczamy średnią kaloryczność z ostatnich 7 dni
    const avgCaloriesLast7Days = useMemo(() => {
        if (!historicalMeals || historicalMeals.length === 0) return 0;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const mealsLast7Days = historicalMeals.filter(meal => new Date(meal.timestamp.seconds * 1000) >= sevenDaysAgo);

        const dailyTotals = mealsLast7Days.reduce((acc, meal) => {
            const date = new Date(meal.timestamp.seconds * 1000).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + meal.calories;
            return acc;
        }, {});

        const dailyValues = Object.values(dailyTotals);
        if (dailyValues.length === 0) return 0;

        const totalCalories = dailyValues.reduce((sum, calories) => sum + calories, 0);
        return Math.round(totalCalories / dailyValues.length);
    }, [historicalMeals]);

    // Znajdujemy najczęściej podawaną karmę
    const mostFrequentFood = useMemo(() => {
        if (!historicalMeals || historicalMeals.length === 0) return "Brak danych";

        const foodCounts = historicalMeals.reduce((acc, meal) => {
            acc[meal.foodName] = (acc[meal.foodName] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(foodCounts).reduce((a, b) => foodCounts[a] > foodCounts[b] ? a : b, "Brak danych");
    }, [historicalMeals]);

    // Określamy trend wagi
    const weightTrend = useMemo(() => {
        if (!historicalWeight || historicalWeight.length < 2) return {
            icon: <LucideMinus className="text-gray-500 h-6 w-6"/>, text: "Brak danych"
        };

        const lastTwoEntries = historicalWeight.slice(-2);
        const [previous, latest] = lastTwoEntries;

        if (latest.weight > previous.weight) {
            return {icon: <LucideTrendingUp className="text-red-500 h-6 w-6"/>, text: "Wzrostowy"};
        }
        if (latest.weight < previous.weight) {
            return {icon: <LucideTrendingDown className="text-green-500 h-6 w-6"/>, text: "Spadkowy"};
        }
        return {icon: <LucideMinus className="text-blue-500 h-6 w-6"/>, text: "Stabilny"};
    }, [historicalWeight]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex justify-center items-center">
                <Spinner/>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div {...collapsible.triggerProps}>
                <h2 className={`${typographyStyles.h2} flex items-center`}>
                    <LucideBarChart3 className="mr-2 h-6 w-6 text-indigo-500"/> Podsumowanie
                </h2>
                <LucideChevronDown
                    className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${collapsible.isOpen ? 'rotate-180' : ''}`}/>
            </div>
            <div {...collapsible.contentProps}>
                <div className="overflow-hidden">
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={<LucideFlame className="text-orange-500 h-6 w-6"/>}
                            title="Śr. kalorie (7 dni)"
                            value={avgCaloriesLast7Days}
                            unit="kcal"
                        />
                        <StatCard
                            icon={<LucideBone className="text-yellow-600 h-6 w-6"/>}
                            title="Ulubiona karma"
                            value={mostFrequentFood}
                        />
                        <StatCard
                            icon={weightTrend.icon}
                            title="Trend wagi"
                            value={weightTrend.text}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;