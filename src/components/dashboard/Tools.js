// /src/components/dashboard/Tools.js

import React from 'react';
import {
    LucideBone, LucideChevronDown, LucideSettings, LucidePlusCircle, LucideList,
    LucideBarChart3, LucideDownload, LucideTestTube, LucideBookMarked
} from 'lucide-react';

// Import ujednoliconych stylów
import {formStyles, typographyStyles} from '../../utils/formStyles';

const Tools = ({
                   onAccountSettingsClick,
                   onAddFoodClick,
                   onManageFoodsClick,
                   onStatsClick,
                   onExportClick,
                   onLabResultsClick,
                   onManageVetsClick, // Nowy prop dla modala weterynarzy
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
                        <button onClick={onAccountSettingsClick} className={formStyles.buttonSecondary}>
                            <LucideSettings className="mr-2 h-5 w-5"/> Ustawienia konta
                        </button>
                        <button onClick={onAddFoodClick} className={formStyles.buttonTertiary}>
                            <LucidePlusCircle className="mr-2 h-5 w-5"/> Dodaj nową karmę
                        </button>
                        <button onClick={onManageFoodsClick} className={formStyles.buttonSecondary}>
                            <LucideList className="mr-2 h-5 w-5"/> Zarządzaj karmami
                        </button>
                        {/* Nowy przycisk do zarządzania weterynarzami */}
                        <button onClick={onManageVetsClick} className={formStyles.buttonSecondary}>
                            <LucideBookMarked className="mr-2 h-5 w-5"/> Moi Weterynarze
                        </button>
                        <button onClick={onStatsClick} className={formStyles.buttonSecondary}>
                            <LucideBarChart3 className="mr-2 h-5 w-5"/> Pokaż statystyki
                        </button>
                        <button onClick={onExportClick} className={formStyles.buttonSecondary}>
                            <LucideDownload className="mr-2 h-5 w-5"/> Eksportuj dane
                        </button>
                        <button onClick={onLabResultsClick} className={formStyles.buttonSecondary}>
                            <LucideTestTube className="mr-2 h-5 w-5"/> Wyniki badań
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;