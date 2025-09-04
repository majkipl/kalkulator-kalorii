// /src/components/dashboard/MealLog.js

import React from 'react';
import AddMealForm from '../AddMealForm';
import {
    LucideCalendarDays, LucideChevronDown, LucideChevronLeft, LucideChevronRight,
    LucideAlertTriangle, LucideClipboardEdit, LucideTrash2
} from 'lucide-react';
import {typographyStyles} from "../../utils/formStyles";

const MealLog = ({
                     cat,
                     currentDate,
                     onDateChange,
                     dailyData,
                     foods,
                     onAddMeal,
                     onEditMeal,
                     onDeleteMeal,
                     theme,
                     collapsible,
                     currentDer
                 }) => {
    const {meals} = dailyData;
    const dayDer = dailyData.der > 0 ? dailyData.der : currentDer;
    const totalCaloriesToday = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const calorieProgress = dayDer > 0 ? (totalCaloriesToday / dayDer) * 100 : 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div {...collapsible.triggerProps}>
                <h2 className={`${typographyStyles.h2} flex items-center`}>
                    <LucideCalendarDays className="mr-2 h-6 w-6 text-indigo-500"/> Dziennik Posiłków
                </h2>
                <LucideChevronDown
                    className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${collapsible.isOpen ? 'rotate-180' : ''}`}/>
            </div>
            <div {...collapsible.contentProps}>
                <div className="overflow-hidden">
                    <div className="pt-4">
                        <div
                            className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <button onClick={() => onDateChange(-1)}
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                <LucideChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300"/></button>
                            <span
                                className="font-semibold text-gray-700 dark:text-gray-300 text-center">{new Date(currentDate + 'T00:00:00').toLocaleDateString('pl-PL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            <button onClick={() => onDateChange(1)}
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                <LucideChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300"/></button>
                        </div>

                        {cat.chronicDisease !== 'brak' && (
                            <div
                                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow mb-4">
                                <div className="flex">
                                    <div className="py-1"><LucideAlertTriangle className="h-6 w-6 text-red-500 mr-4"/>
                                    </div>
                                    <div><p className="font-bold">Ważne!</p><p className="text-sm">Wybrano chorobę
                                        przewlekłą. Pamiętaj, że dieta kota musi być bezwzględnie skonsultowana z
                                        lekarzem weterynarii.</p></div>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full transition-all duration-500 ${calorieProgress > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{width: `${Math.min(calorieProgress, 100)}%`}}></div>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span
                                    className="font-medium text-gray-700 dark:text-gray-300">{Math.round(totalCaloriesToday)} kcal</span>
                                <span className="font-medium text-gray-500 dark:text-gray-400">{dayDer} kcal</span>
                            </div>
                            {calorieProgress > 100 && (
                                <p className="text-center text-sm font-semibold text-red-600 mt-2">Przekroczono
                                    zapotrzebowanie o {Math.round(totalCaloriesToday - dayDer)} kcal!</p>)}
                        </div>

                        <AddMealForm foods={foods} onSave={onAddMeal} theme={theme}/>

                        <div className="mt-6 space-y-3">
                            <h3 className={typographyStyles.h3}>Posiłki z wybranego
                                dnia:</h3>
                            {meals.length > 0 ? (
                                meals.sort((a, b) => new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000)).map(meal => (
                                    <div key={meal.id}
                                         className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{meal.foodName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{meal.weight}g &bull; {Math.round(meal.calories)} kcal</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button onClick={() => onEditMeal(meal)}
                                                    className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-600 transition">
                                                <LucideClipboardEdit className="h-4 w-4"/></button>
                                            <button onClick={() => onDeleteMeal(meal.id)}
                                                    aria-label="Usuń posiłek"
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition">
                                                <LucideTrash2 className="h-4 w-4"/></button>
                                        </div>
                                    </div>
                                ))
                            ) : (<p className="text-center text-gray-500 dark:text-gray-400 py-4">Brak posiłków w tym
                                dniu.</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealLog;