// /src/components/dashboard/Tools.js

import React from 'react';
import {
    LucideBone, LucideChevronDown, LucideSettings, LucidePlusCircle, LucideList,
    LucideBarChart3, LucideDownload, LucideTestTube
} from 'lucide-react';
import {typographyStyles} from "../../utils/formStyles";

const Tools = ({
                   onAccountSettingsClick,
                   onAddFoodClick,
                   onManageFoodsClick,
                   onStatsClick,
                   onExportClick,
                   onLabResultsClick,
                   collapsible
               }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div {...collapsible.triggerProps}>
                <h2 className={`${typographyStyles.h2} flex items-center`}>
                    <LucideBone className="mr-2 h-6 w-6 text-indigo-500"/>Narzędzia
                </h2>
                <LucideChevronDown
                    className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${collapsible.isOpen ? 'rotate-180' : ''}`}/>
            </div>
            <div {...collapsible.contentProps}>
                <div className="overflow-hidden">
                    <div className="pt-4 space-y-2">
                        <button onClick={onAccountSettingsClick}
                                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                            <LucideSettings className="mr-2 h-5 w-5"/> Ustawienia konta
                        </button>
                        <button onClick={onAddFoodClick}
                                className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                            <LucidePlusCircle className="mr-2 h-5 w-5"/> Dodaj nową karmę
                        </button>
                        <button onClick={onManageFoodsClick}
                                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                            <LucideList className="mr-2 h-5 w-5"/> Zarządzaj karmami
                        </button>
                        <button onClick={onStatsClick}
                                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                            <LucideBarChart3 className="mr-2 h-5 w-5"/> Pokaż statystyki
                        </button>
                        <button onClick={onExportClick}
                                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                            <LucideDownload className="mr-2 h-5 w-5"/> Eksportuj dane
                        </button>
                        <button onClick={onLabResultsClick}
                                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                            <LucideTestTube className="mr-2 h-5 w-5"/> Wyniki badań
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;