// /src/components/CatProfileForm.js

import React, {useState} from 'react';
import Select from 'react-select';
import {LucideSave, LucideTrash2} from 'lucide-react';

// Importy hooków i ujednoliconych stylów
import {useAppContext} from '../context/AppContext';
import {formStyles, getCustomSelectStyles, typographyStyles} from '../utils/formStyles';

import { breedOptions, activityLevelOptions, physiologicalStateOptions, chronicDiseaseOptions } from '../config/options';

const CatProfileForm = ({cat, onSave, onCancel, onDeleteRequest}) => {
    // Pobieramy 'theme' bezpośrednio z kontekstu
    const {theme, isDark} = useAppContext();

    // Stany lokalne formularza
    const [years, setYears] = useState(cat ? Math.floor(cat.age) : '1');
    const [months, setMonths] = useState(cat ? Math.round((cat.age - Math.floor(cat.age)) * 12) : '0');
    const [formData, setFormData] = useState({
        name: cat?.name || '',
        currentWeight: cat?.currentWeight || '',
        targetWeight: cat?.targetWeight || '',
        isNeutered: cat?.isNeutered || false,
        activityLevel: cat?.activityLevel || 'umiarkowany',
        physiologicalState: cat?.physiologicalState || 'normalny',
        chronicDisease: cat?.chronicDisease || 'brak',
        breed: cat?.breed || 'mieszany'
    });

    // Opcje dla pól typu Select





    // Logika stylów dla react-select na podstawie motywu
    const customSelectStyles = getCustomSelectStyles(isDark);

    // Handlery formularza
    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };

    const handleSelectChange = (name) => (selectedOption) => {
        setFormData(prev => ({...prev, [name]: selectedOption.value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalAge = parseInt(years, 10) + (parseInt(months, 10) / 12);
        const dataToSave = {
            ...formData,
            age: finalAge,
            currentWeight: parseFloat(formData.currentWeight) || 0,
            targetWeight: parseFloat(formData.targetWeight) || 0,
        };
        onSave(dataToSave);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                <h2 className={`${typographyStyles.h2} mb-4`}>{cat ? 'Edytuj profil' : 'Stwórz nowy profil'}</h2>

                <div>
                    <label className={typographyStyles.label}>Nazwa kota</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                           className={formStyles.input} required/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={typographyStyles.label}>Aktualna waga (kg)</label>
                        <input type="number" step="0.1" name="currentWeight" value={formData.currentWeight}
                               onChange={handleChange} className={formStyles.input} required/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Docelowa waga (kg)</label>
                        <input type="number" step="0.1" name="targetWeight" value={formData.targetWeight}
                               onChange={handleChange} className={formStyles.input} placeholder="Opcjonalnie"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={typographyStyles.label}>Wiek (lata)</label>
                        <input type="number" value={years} onChange={(e) => setYears(e.target.value)}
                               className={formStyles.input} min="0" required/>
                    </div>
                    {parseInt(years, 10) === 0 && (
                        <div>
                            <label className={typographyStyles.label}>Miesiące</label>
                            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)}
                                   className={formStyles.input} min="0" max="11" required/>
                        </div>
                    )}
                </div>

                <div>
                    <label className={typographyStyles.label}>Rasa</label>
                    <Select name="breed" options={breedOptions}
                            value={breedOptions.find(o => o.value === formData.breed)}
                            onChange={handleSelectChange('breed')} styles={customSelectStyles} className="mt-1"
                            placeholder="Wybierz rasę..." required/>
                </div>

                <div>
                    <label className={typographyStyles.label}>Poziom aktywności</label>
                    <Select name="activityLevel" options={activityLevelOptions}
                            value={activityLevelOptions.find(o => o.value === formData.activityLevel)}
                            onChange={handleSelectChange('activityLevel')} styles={customSelectStyles} className="mt-1"
                            required/>
                </div>

                <div>
                    <label className={typographyStyles.label}>Stan fizjologiczny</label>
                    <Select name="physiologicalState" options={physiologicalStateOptions}
                            value={physiologicalStateOptions.find(o => o.value === formData.physiologicalState)}
                            onChange={handleSelectChange('physiologicalState')} styles={customSelectStyles}
                            className="mt-1" required/>
                </div>

                <div>
                    <label className={typographyStyles.label}>Choroba przewlekła</label>
                    <Select name="chronicDisease" options={chronicDiseaseOptions}
                            value={chronicDiseaseOptions.find(o => o.value === formData.chronicDisease)}
                            onChange={handleSelectChange('chronicDisease')} styles={customSelectStyles} className="mt-1"
                            required/>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="isNeutered" name="isNeutered" checked={formData.isNeutered}
                           onChange={handleChange} className={typographyStyles.checkbox}/>
                    <label htmlFor="isNeutered" className={`${typographyStyles.label} ml-2`}>Kot sterylizowany/kastrowany</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onCancel} className={formStyles.buttonCancel}>Anuluj</button>
                    <button type="submit" className={formStyles.buttonSubmit}>
                        <LucideSave className="mr-2 h-4 w-4"/> Zapisz
                    </button>
                </div>
            </form>

            {onDeleteRequest && (
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                    <button type="button" onClick={onDeleteRequest} className={formStyles.buttonDestructive}>
                        <LucideTrash2 className="mr-2 h-4 w-4"/> Usuń Profil Kota
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatProfileForm;