// /src/components/dashboard/CatProfile.js

import React from 'react';
import CatProfileForm from '../CatProfileForm';
import formatAgeText from '../../utils/ageFormatter';
import {
    LucideBookUser, LucideClipboardEdit, LucideChevronDown, LucideCat, LucideWeight,
    LucideTarget, LucideSprout, LucideBone, LucideActivity, LucideHeartPulse, LucideStethoscope
} from 'lucide-react';
import {typographyStyles} from "../../utils/formStyles";

const CatProfile = ({cat, isEditing, onEditToggle, onUpdate, onDeleteRequest, theme, collapsible}) => {
    const physiologicalStateText = {
        normalny: 'Normalny',
        ciaza: 'Ciąża',
        laktacja: 'Laktacja',
        rekonwalescencja: 'Rekonwalescencja'
    };
    const chronicDiseaseText = {
        brak: 'Brak',
        nadczynnosc_tarczycy: 'Nadczynność tarczycy',
        choroba_nerek: 'Choroba nerek',
        cukrzyca: 'Cukrzyca',
        choroby_serca: 'Choroby serca',
        choroby_drog_moczowych: 'Choroby dróg moczowych',
        zapalenie_trzustki: 'Zapalenie trzustki',
        nieswoiste_zapalenie_jelit: 'Nieswoiste zapalenie jelit'
    };
    const breedText = {
        mieszany: 'Mieszany / Inny',
        europejski: 'Europejski krótkowłosy',
        brytyjski: 'Brytyjski krótkowłosy',
        maine_coon: 'Maine Coon',
        ragdoll: 'Ragdoll',
        syberyjski: 'Syberyjski',
        bengalski: 'Bengalski',
        sfinks: 'Sfinks'
    };

    if (isEditing) {
        return (
            <CatProfileForm
                cat={cat}
                onSave={onUpdate}
                onCancel={() => onEditToggle(false)}
                theme={theme}
                onDeleteRequest={onDeleteRequest}
            />
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div {...collapsible.triggerProps}>
                <h2 className={`${typographyStyles.h2} flex items-center`}>
                    <LucideBookUser className="mr-2 h-6 w-6 text-indigo-500"/> Profil kota
                </h2>
                <div className="flex items-center">
                    <button onClick={(e) => {
                        e.stopPropagation();
                        onEditToggle(true);
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
                        <p className="flex items-center"><LucideCat
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Rasa:</strong> <span
                            className="ml-auto font-medium">{breedText[cat.breed] || 'Inny'}</span></p>
                        <p className="flex items-center"><LucideWeight
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Aktualna waga:</strong>
                            <span className="ml-auto font-medium">{cat.currentWeight} kg</span></p>
                        <p className="flex items-center"><LucideTarget
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Docelowa waga:</strong>
                            <span
                                className="ml-auto font-medium">{cat.targetWeight > 0 ? `${cat.targetWeight} kg` : 'Brak'}</span>
                        </p>
                        <p className="flex items-center">
                            <LucideSprout className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/>
                            <strong>Wiek:</strong>
                            <span className="ml-auto font-medium">{formatAgeText(cat.age)}</span>
                        </p>
                        <p className="flex items-center"><LucideBone
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Kastracja:</strong>
                            <span className="ml-auto font-medium">{cat.isNeutered ? 'Tak' : 'Nie'}</span></p>
                        <p className="flex items-center"><LucideActivity
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Aktywność:</strong>
                            <span className="ml-auto font-medium capitalize">{cat.activityLevel}</span></p>
                        <p className="flex items-center"><LucideHeartPulse
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Stan
                            fizjologiczny:</strong> <span
                            className="ml-auto font-medium">{physiologicalStateText[cat.physiologicalState] || 'Normalny'}</span>
                        </p>
                        <p className="flex items-center"><LucideStethoscope
                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Choroba
                            przewlekła:</strong> <span
                            className="ml-auto font-medium">{chronicDiseaseText[cat.chronicDisease] || 'Brak'}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatProfile;