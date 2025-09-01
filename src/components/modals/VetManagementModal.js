// /src/components/modals/VetManagementModal.js

import React, {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {vetSchema} from '../../schemas/vetSchema';
import {collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import {userVetsCollectionPath} from '../../firebase/paths'; // Potrzebujemy nowej ścieżki
import {formStyles, typographyStyles} from '../../utils/formStyles';
import FormError from '../../shared/FormError';
import {LucideX, LucidePlusCircle, LucideTrash2, LucidePencil, LucideBookMarked} from 'lucide-react';

const VetManagementModal = ({onCancel}) => {
    const {user} = useAuth();
    const {showToast} = useAppContext();
    const [vets, setVets] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingVet, setEditingVet] = useState(null);

    const vetsPath = userVetsCollectionPath(user.uid);

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(vetSchema)
    });

    useEffect(() => {
        const q = query(collection(db, vetsPath));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setVets(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
        });
        return () => unsubscribe();
    }, [vetsPath]);

    useEffect(() => {
        if (editingVet) {
            reset(editingVet);
            setIsFormVisible(true);
        } else {
            reset({clinicName: '', vetName: '', address: '', phone: '', notes: ''});
        }
    }, [editingVet, reset]);

    const handleSaveVet = async (data) => {
        try {
            if (editingVet) {
                await updateDoc(doc(db, vetsPath, editingVet.id), data);
                showToast("Dane weterynarza zaktualizowane.");
            } else {
                await addDoc(collection(db, vetsPath), data);
                showToast("Nowy weterynarz dodany.");
            }
            setEditingVet(null);
            setIsFormVisible(false);
        } catch (error) {
            showToast("Błąd podczas zapisu.", "error");
        }
    };

    const handleDeleteVet = async (vetId) => {
        if (window.confirm("Czy na pewno chcesz usunąć tego weterynarza?")) {
            try {
                await deleteDoc(doc(db, vetsPath, vetId));
                showToast("Weterynarz usunięty.");
            } catch (error) {
                showToast("Błąd podczas usuwania.", "error");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up flex flex-col"
                style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={typographyStyles.h2}><LucideBookMarked className="mr-2"/>Moi Weterynarze</h2>
                    <button type="button" onClick={onCancel}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <button onClick={() => {
                        setEditingVet(null);
                        setIsFormVisible(!isFormVisible);
                    }} className={`${formStyles.buttonTertiary} mb-4`}>
                        <LucidePlusCircle
                            className="mr-2 h-5 w-5"/> {isFormVisible ? 'Anuluj dodawanie' : 'Dodaj nowego weterynarza'}
                    </button>

                    {isFormVisible && (
                        <form onSubmit={handleSubmit(handleSaveVet)}
                              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 space-y-3">
                            <h3 className={typographyStyles.h3}>{editingVet ? 'Edytuj dane' : 'Nowy weterynarz'}</h3>
                            <div>
                                <label className={typographyStyles.label}>Nazwa lecznicy</label>
                                <input {...register("clinicName")} className={formStyles.input}
                                       aria-invalid={!!errors.clinicName}/>
                                <FormError message={errors.clinicName?.message}/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={typographyStyles.label}>Imię i nazwisko (opcjonalnie)</label>
                                    <input {...register("vetName")} className={formStyles.input}
                                           aria-invalid={!!errors.vetName}/>
                                    <FormError message={errors.vetName?.message}/>
                                </div>
                                <div>
                                    <label className={typographyStyles.label}>Telefon (opcjonalnie)</label>
                                    <input {...register("phone")} className={formStyles.input}
                                           aria-invalid={!!errors.phone}/>
                                    <FormError message={errors.phone?.message}/>
                                </div>
                            </div>
                            <div>
                                <label className={typographyStyles.label}>Adres (opcjonalnie)</label>
                                <input {...register("address")} className={formStyles.input}
                                       aria-invalid={!!errors.address}/>
                                <FormError message={errors.address?.message}/>
                            </div>
                            <div>
                                <label className={typographyStyles.label}>Notatki (opcjonalnie)</label>
                                <textarea {...register("notes")} className={`${formStyles.textarea} h-20`}
                                          aria-invalid={!!errors.notes}/>
                                <FormError message={errors.notes?.message}/>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsFormVisible(false)}
                                        className={formStyles.buttonCancel}>Anuluj
                                </button>
                                <button type="submit" className={formStyles.buttonSubmit}>Zapisz</button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-2">
                        {vets.length > 0 ? vets.map(vet => (
                            <div key={vet.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{vet.clinicName}</p>
                                        {vet.vetName && <p className="text-sm">{vet.vetName}</p>}
                                        {vet.address && <p className="text-sm text-gray-500">{vet.address}</p>}
                                        {vet.phone && <p className="text-sm text-gray-500">tel: {vet.phone}</p>}
                                        {vet.notes &&
                                            <p className="text-xs italic mt-2 text-gray-600 dark:text-gray-400">Notatki: {vet.notes}</p>}
                                    </div>
                                    <div className='flex-shrink-0'>
                                        <button onClick={() => setEditingVet(vet)} className="p-1"><LucidePencil
                                            size={16}/></button>
                                        <button onClick={() => handleDeleteVet(vet.id)} className="p-1 text-red-500">
                                            <LucideTrash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Brak zapisanych
                                weterynarzy.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VetManagementModal;