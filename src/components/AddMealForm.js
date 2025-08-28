import React, {useState, useMemo} from 'react';
import Select from 'react-select';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-subtle.css';
import {getCustomSelectStyles} from '../utils/formStyles';
import {LucidePlusCircle, LucideBone} from 'lucide-react';

const AddMealForm = ({foods, onSave, theme}) => {
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [weight, setWeight] = useState('');

    const inputClassName = "block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 min-h-[38px] px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const customStyles = getCustomSelectStyles(isDark);

    const foodOptions = useMemo(() =>
            foods.map(food => ({
                value: food.id,
                label: food.name,
                calories: food.calories,
                photoURL: food.photoURL || null,
            })),
        [foods]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFoodId || !weight) return;
        const food = foods.find(f => f.id === selectedFoodId);
        if (!food) return;
        const calories = (parseFloat(weight) / 100) * food.calories;
        const mealData = {
            foodId: food.id,
            foodName: food.name,
            foodType: food.type,
            weight: parseFloat(weight),
            calories: calories
        };
        onSave(mealData);
        setSelectedFoodId('');
        setWeight('');
    };

    const handleSelectChange = (selectedOption) => {
        setSelectedFoodId(selectedOption ? selectedOption.value : '');
    };

    const CustomOption = ({innerProps, label, data}) => {
        const content = (
            <div
                className={`flex items-center p-2 cursor-pointer ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                <div
                    className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                    {data.photoURL ?
                        <img src={data.photoURL} alt={label} className="w-full h-full object-cover rounded-md"/> :
                        <LucideBone className="w-5 h-5 text-gray-400"/>}
                </div>
                <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{data.calories} kcal/100g</div>
                </div>
            </div>
        );
        return data.photoURL ? <Tippy content={<img src={data.photoURL} alt={`Powiększenie ${label}`}
                                                    className="w-36 h-36 object-contain rounded-md"/>} placement="left"
                                      animation="scale-subtle" delay={[200, 0]}>
            <div {...innerProps}>{content}</div>
        </Tippy> : <div {...innerProps}>{content}</div>;
    };

    const CustomSingleValue = ({children, ...props}) => {
        const {data} = props;
        const content = (
            <div className="flex items-center">
                <div
                    className="w-6 h-6 mr-2 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                    {data.photoURL ?
                        <img src={data.photoURL} alt={children} className="w-full h-full object-cover rounded-md"/> :
                        <LucideBone className="w-4 h-4 text-gray-400"/>}
                </div>
                <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{children}</span>
            </div>
        );
        return data.photoURL ? <Tippy content={<img src={data.photoURL} alt={`Powiększenie ${children}`}
                                                    className="w-36 h-36 object-contain rounded-md"/>} placement="top"
                                      animation="scale-subtle" delay={[100, 0]}>{content}</Tippy> : content;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start text-gray-700 dark:text-gray-300">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Wybierz karmę</label>
                    <Select styles={customStyles} options={foodOptions}
                            value={foodOptions.find(o => o.value === selectedFoodId)} onChange={handleSelectChange}
                            placeholder="Wyszukaj lub wybierz karmę..." isClearable required
                            components={{Option: CustomOption, SingleValue: CustomSingleValue}}/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Ilość (g)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                           className={inputClassName} placeholder="np. 50" required/>
                </div>
            </div>
            <button type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center h-10">
                <LucidePlusCircle className="mr-2 h-5 w-5"/> Dodaj posiłek
            </button>
        </form>
    );
};

export default AddMealForm;