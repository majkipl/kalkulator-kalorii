// /src/components/modals/VetVisitFormModal.js

import React, {useEffect, useRef, useMemo} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {vetVisitSchema} from '../../schemas/vetVisitSchema';
import Select from 'react-select';
import {LucideX} from 'lucide-react';
import {useAppContext} from '../../context/AppContext';
import {formStyles, typographyStyles, getCustomSelectStyles} from '../../utils/formStyles';
import FormError from '../../shared/FormError';

const VetVisitFormModal = ({onSave, onCancel, initialData, vets}) => {
    const {isDark} = useAppContext();

    // Mapujemy listę weterynarzy na format wymagany przez react-select
    const vetOptions = useMemo(() =>
            vets.map(vet => ({value: vet.id, label: vet.clinicName})),
        [vets]);

    const {register, handleSubmit, control, formState: {errors}, reset} = useForm({
        resolver: zodResolver(vetVisitSchema),
        defaultValues: {
            date: initialData?.date ? new Date(initialData.date.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            // Znajdujemy odpowiedni obiekt dla react-select na podstawie ID
            vet: initialData?.vetId ? vetOptions.find(opt => opt.value === initialData.vetId) : null,
            reason: initialData?.reason || '',
            diagnosis: initialData?.diagnosis || '',
            recommendations: initialData?.recommendations || '',
        }
    });

    const selectRef = useRef(null);
    useEffect(() => {
        setTimeout(() => selectRef.current?.focus(), 100);
    }, []);

    const processSubmit = (data) => {
        // Przygotowujemy dane do zapisu, wyciągając ID i nazwę z obiektu `vet`
        const dataToSave = {
            ...data,
            date: new Date(data.date),
            vetId: data.vet.value,
            vetName: data.vet.label,
        };
        delete dataToSave.vet; // Usuwamy zbędny obiekt
        onSave(dataToSave);
    };

    const customSelectStyles = getCustomSelectStyles(isDark);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className={typographyStyles.h2}>{initialData ? 'Edytuj wizytę' : 'Dodaj wizytę u weterynarza'}</h2>
                        <button type="button" onClick={onCancel}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Data wizyty</label>
                        <input type="date" {...register("date")} className={formStyles.input}
                               aria-invalid={!!errors.date}/>
                        <FormError message={errors.date?.message}/>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Lecznica / Weterynarz</label>
                        <Controller
                            name="vet"
                            control={control}
                            render={({field}) => (
                                <Select
                                    ref={selectRef}
                                    {...field}
                                    options={vetOptions}
                                    placeholder="Wybierz z listy lub dodaj w 'Narzędziach'"
                                    styles={customSelectStyles}
                                    className="mt-1"
                                    aria-invalid={!!errors.vet}
                                    noOptionsMessage={() => "Brak zapisanych weterynarzy"}
                                />
                            )}
                        />
                        <FormError message={errors.vet?.message}/>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Powód wizyty</label>
                        <input type="text" {...register("reason")} className={formStyles.input}
                               aria-invalid={!!errors.reason}/>
                        <FormError message={errors.reason?.message}/>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Diagnoza (opcjonalnie)</label>
                        <textarea {...register("diagnosis")} className={`${formStyles.textarea} h-24`}
                                  aria-invalid={!!errors.diagnosis}/>
                        <FormError message={errors.diagnosis?.message}/>
                    </div>

                    <div>
                        <label className={typographyStyles.label}>Zalecenia (opcjonalnie)</label>
                        <textarea {...register("recommendations")} className={`${formStyles.textarea} h-24`}
                                  aria-invalid={!!errors.recommendations}/>
                        <FormError message={errors.recommendations?.message}/>
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

export default VetVisitFormModal;