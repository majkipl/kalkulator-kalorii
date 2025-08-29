// /src/components/modals/LabResultsModal.js

import React, {useState, useEffect, useRef} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {labResultSchema} from '../../schemas/labResultSchema';
import {collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków, komponentów i stylów
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import Spinner from '../../shared/Spinner';
import {formStyles, typographyStyles} from '../../utils/formStyles';
import {LucideX, LucidePlusCircle, LucideTrash2} from 'lucide-react';

/**
 * Mały komponent pomocniczy do wyświetlania błędów walidacji.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
};

const LabResultsModal = ({catId, onCancel}) => {
    const {user} = useAuth();
    const {showToast} = useAppContext();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // 1. Tworzymy referencję do pierwszego pola formularza
    const firstInputRef = useRef(null);

    const catsPath = userCatsCollectionPath(user.uid);

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(labResultSchema),
        defaultValues: {
            testName: '',
            result: '',
            unit: '',
            referenceRange: '',
            date: new Date().toISOString().split('T')[0],
        }
    });

    // 2. Efekt, który ustawi focus, gdy formularz dodawania stanie się widoczny
    useEffect(() => {
        if (isAdding && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current.focus();
            }, 100);
        }
    }, [isAdding]);

    useEffect(() => {
        const resultsCol = collection(db, catsPath, catId, 'labResults');
        const q = query(resultsCol, orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setResults(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [catId, catsPath]);

    const handleAddResult = async (data) => {
        try {
            const resultsCol = collection(db, catsPath, catId, 'labResults');
            await addDoc(resultsCol, {...data, date: new Date(data.date)});

            reset();
            setIsAdding(false);
            showToast("Wynik badania został dodany.");
        } catch (error) {
            showToast("Błąd dodawania wyniku.", "error");
        }
    };

    const handleDeleteResult = async (resultId) => {
        try {
            await deleteDoc(doc(db, catsPath, catId, 'labResults', resultId));
            showToast("Wynik badania został usunięty.");
        } catch (error) {
            showToast("Błąd usuwania wyniku.", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in-up flex flex-col"
                style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={typographyStyles.h2}>Wyniki badań laboratoryjnych</h2>
                    <button type="button" onClick={onCancel}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX/></button>
                </div>
                {loading ? <Spinner/> : (
                    <div className="flex-grow overflow-y-auto pr-2">
                        <button onClick={() => setIsAdding(!isAdding)} className={`${formStyles.buttonTertiary} mb-4`}>
                            <LucidePlusCircle
                                className="mr-2 h-5 w-5"/> {isAdding ? 'Anuluj dodawanie' : 'Dodaj nowy wynik'}
                        </button>
                        {isAdding && (
                            <form onSubmit={handleSubmit(handleAddResult)}
                                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 space-y-3">
                                <div>
                                    <input
                                        placeholder="Nazwa badania (np. Kreatynina)"
                                        className={formStyles.input}
                                        {...register("testName")}
                                        ref={firstInputRef} // 3. Dowiązujemy ref
                                        aria-invalid={errors.testName ? "true" : "false"}
                                    />
                                    <FormError message={errors.testName?.message}/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <input
                                            placeholder="Wynik"
                                            className={formStyles.input}
                                            {...register("result")}
                                            aria-invalid={errors.result ? "true" : "false"}
                                        />
                                        <FormError message={errors.result?.message}/>
                                    </div>
                                    <div>
                                        <input
                                            placeholder="Jednostka"
                                            className={formStyles.input}
                                            {...register("unit")}
                                            aria-invalid={errors.unit ? "true" : "false"}
                                        />
                                        <FormError message={errors.unit?.message}/>
                                    </div>
                                    <div>
                                        <input
                                            placeholder="Zakres ref."
                                            className={formStyles.input}
                                            {...register("referenceRange")}
                                            aria-invalid={errors.referenceRange ? "true" : "false"}
                                        />
                                        <FormError message={errors.referenceRange?.message}/>
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        className={formStyles.input}
                                        {...register("date")}
                                        aria-invalid={errors.date ? "true" : "false"}
                                    />
                                    <FormError message={errors.date?.message}/>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsAdding(false)}
                                            className={`${formStyles.buttonCancel} w-auto text-sm px-3 py-1.5`}>Anuluj
                                    </button>
                                    <button type="submit"
                                            className={`${formStyles.buttonSubmit} w-auto text-sm px-3 py-1.5`}>Zapisz
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="space-y-2">
                            {results.length > 0 ? results.map(res => (
                                <div key={res.id}
                                     className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{res.testName}: <span
                                            className="font-normal">{res.result} {res.unit}</span></p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Zakres
                                            ref.: {res.referenceRange} |
                                            Data: {res.date.toDate().toLocaleDateString('pl-PL')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteResult(res.id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                        aria-label={`Usuń wynik badania ${res.testName}`}
                                    >
                                        <LucideTrash2 size={16}/>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Brak zapisanych
                                    wyników.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabResultsModal;