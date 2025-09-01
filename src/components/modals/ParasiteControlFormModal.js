// /src/components/modals/ParasiteControlFormModal.js

import React, {useEffect, useRef} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {parasiteControlSchema} from '../../schemas/parasiteControlSchema';
import {LucideX} from 'lucide-react';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles} from '../../utils/formStyles';
import FormError from '../../shared/FormError';

const ParasiteControlFormModal = ({onSave, onCancel, initialData, eventType}) => {
    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(parasiteControlSchema),
        defaultValues: {
            date: initialData?.date ? new Date(initialData.date.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            productName: initialData?.productName || '',
            nextDueDate: initialData?.nextDueDate ? new Date(initialData.nextDueDate.seconds * 1000).toISOString().split('T')[0] : '',
        }
    });

    const firstInputRef = useRef(null);
    useEffect(() => {
        setTimeout(() => firstInputRef.current?.focus(), 100);
    }, []);

    const processSubmit = (data) => {
        const dataToSave = {
            ...data,
            date: new Date(data.date),
            nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        };
        onSave(dataToSave);
    };

    const title = eventType === 'vaccination' ? (initialData ? 'Edytuj szczepienie' : 'Dodaj szczepienie') : (initialData ? 'Edytuj odrobaczenie' : 'Dodaj odrobaczenie');
    const productNameLabel = eventType === 'vaccination' ? 'Nazwa szczepionki' : 'Nazwa preparatu';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className={typographyStyles.h2}>{title}</h2>
                        <button type="button" onClick={onCancel}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Data podania</label>
                        <input type="date" {...register("date")} className={formStyles.input}
                               aria-invalid={!!errors.date}/>
                        <FormError message={errors.date?.message}/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>{productNameLabel}</label>
                        <input type="text" {...register("productName")} className={formStyles.input} ref={firstInputRef}
                               aria-invalid={!!errors.productName}/>
                        <FormError message={errors.productName?.message}/>
                    </div>
                    <div>
                        <label className={typographyStyles.label}>Termin następnej dawki (opcjonalnie)</label>
                        <input type="date" {...register("nextDueDate")} className={formStyles.input}
                               aria-invalid={!!errors.nextDueDate}/>
                        <FormError message={errors.nextDueDate?.message}/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className={formStyles.buttonCancel}>Anuluj</button>
                        <button type="submit" className={formStyles.buttonSubmit}>Zapisz</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParasiteControlFormModal;