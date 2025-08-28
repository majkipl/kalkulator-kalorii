import React, {useState} from 'react';
import Select from 'react-select';
import {LucideSave, LucideTrash2} from 'lucide-react';
import {getCustomSelectStyles} from '../utils/formStyles';
import { useAppContext } from '../context/AppContext';

const CatProfileForm = ({cat, onSave, onCancel, onDeleteRequest}) => {
    const { theme } = useAppContext();

    // Stan dla lat i miesięcy, ułatwiający edycję wieku
    const [years, setYears] = useState(cat ? Math.floor(cat.age) : '1');
    const [months, setMonths] = useState(cat ? Math.round((cat.age - Math.floor(cat.age)) * 12) : '0');

    // Główny stan formularza
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

    // --- Definicje (klasy, opcje selectów) ---
    const inputClassName = "mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";
    const breedOptions = [{value: 'mieszany', label: 'Mieszany / Inny'}, {
        value: 'europejski',
        label: 'Europejski krótkowłosy'
    }, {value: 'brytyjski', label: 'Brytyjski krótkowłosy'}, {
        value: 'maine_coon',
        label: 'Maine Coon'
    }, {value: 'ragdoll', label: 'Ragdoll'}, {value: 'syberyjski', label: 'Syberyjski'}, {
        value: 'bengalski',
        label: 'Bengalski'
    }, {value: 'sfinks', label: 'Sfinks'}];
    const activityLevelOptions = [{value: 'niski', label: 'Niski (kot niewychodzący)'}, {
        value: 'umiarkowany',
        label: 'Umiarkowany (kot wychodzący)'
    }, {value: 'wysoki', label: 'Wysoki (bardzo aktywny)'}];
    const physiologicalStateOptions = [{value: 'normalny', label: 'Normalny'}, {
        value: 'ciaza',
        label: 'Ciąża'
    }, {value: 'laktacja', label: 'Laktacja'}, {value: 'rekonwalescencja', label: 'Rekonwalescencja'}];
    const chronicDiseaseOptions = [{value: 'brak', label: 'Brak'}, {
        value: 'nadczynnosc_tarczycy',
        label: 'Nadczynność tarczycy'
    }, {value: 'choroba_nerek', label: 'Przewlekła choroba nerek'}, {
        value: 'cukrzyca',
        label: 'Cukrzyca'
    }, {value: 'choroby_serca', label: 'Choroby serca'}, {
        value: 'choroby_drog_moczowych',
        label: 'Choroby dolnych dróg moczowych (FLUTD)'
    }, {value: 'zapalenie_trzustki', label: 'Zapalenie trzustki'}, {
        value: 'nieswoiste_zapalenie_jelit',
        label: 'Nieswoiste zapalenie jelit (IBD)'
    }];

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const customStyles = getCustomSelectStyles(isDark);

    // --- Handlery ---
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

    // --- Renderowanie ---
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{cat ? 'Edytuj profil' : 'Stwórz nowy profil'}</h2>

                <div>
                    <label className="block text-sm font-medium">Nazwa kota</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                           className={inputClassName} required/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Aktualna waga (kg)</label>
                        <input type="number" step="0.1" name="currentWeight" value={formData.currentWeight}
                               onChange={handleChange} className={inputClassName} required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Docelowa waga (kg)</label>
                        <input type="number" step="0.1" name="targetWeight" value={formData.targetWeight}
                               onChange={handleChange} className={inputClassName} placeholder="Opcjonalnie"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Wiek (lata)</label>
                        <input type="number" value={years} onChange={(e) => setYears(e.target.value)}
                               className={inputClassName} min="0" required/>
                    </div>
                    {parseInt(years, 10) === 0 && (
                        <div>
                            <label className="block text-sm font-medium">Miesiące</label>
                            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)}
                                   className={inputClassName} min="0" max="11" required/>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Rasa</label>
                    <Select name="breed" options={breedOptions}
                            value={breedOptions.find(o => o.value === formData.breed)}
                            onChange={handleSelectChange('breed')} styles={customStyles} className="mt-1"
                            placeholder="Wybierz rasę..." required/>
                </div>

                <div>
                    <label className="block text-sm font-medium">Poziom aktywności</label>
                    <Select name="activityLevel" options={activityLevelOptions}
                            value={activityLevelOptions.find(o => o.value === formData.activityLevel)}
                            onChange={handleSelectChange('activityLevel')} styles={customStyles} className="mt-1"
                            required/>
                </div>

                <div>
                    <label className="block text-sm font-medium">Stan fizjologiczny</label>
                    <Select name="physiologicalState" options={physiologicalStateOptions}
                            value={physiologicalStateOptions.find(o => o.value === formData.physiologicalState)}
                            onChange={handleSelectChange('physiologicalState')} styles={customStyles} className="mt-1"
                            required/>
                </div>

                <div>
                    <label className="block text-sm font-medium">Choroba przewlekła</label>
                    <Select name="chronicDisease" options={chronicDiseaseOptions}
                            value={chronicDiseaseOptions.find(o => o.value === formData.chronicDisease)}
                            onChange={handleSelectChange('chronicDisease')} styles={customStyles} className="mt-1"
                            required/>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="isNeutered" name="isNeutered" checked={formData.isNeutered}
                           onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                    <label htmlFor="isNeutered" className="ml-2 block text-sm">Kot sterylizowany/kastrowany</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onCancel}
                            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj
                    </button>
                    <button type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center">
                        <LucideSave className="mr-2 h-4 w-4"/> Zapisz
                    </button>
                </div>
            </form>

            {onDeleteRequest && (
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                    <button type="button" onClick={onDeleteRequest}
                            className="w-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                        <LucideTrash2 className="mr-2 h-4 w-4"/> Usuń Profil Kota
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatProfileForm;