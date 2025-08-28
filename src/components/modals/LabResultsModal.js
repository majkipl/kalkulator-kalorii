import React, {useState, useEffect} from 'react';
import {collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath} from '../../firebase/paths';

// Importy hooków, komponentów i stylów
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import Spinner from '../../shared/Spinner';
import {formStyles, typographyStyles} from '../../utils/formStyles'; // 1. Import ujednoliconych stylów
import {LucideX, LucidePlusCircle, LucideTrash2} from 'lucide-react';

const LabResultsModal = ({catId, onCancel}) => {
    // Pobieramy dane globalne bezpośrednio w komponencie
    const {user} = useAuth();
    const {showToast} = useAppContext();

    // Stany lokalne
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newResult, setNewResult] = useState({
        testName: '',
        result: '',
        unit: '',
        referenceRange: '',
        date: new Date().toISOString().split('T')[0]
    });

    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        const resultsCol = collection(db, catsPath, catId, 'labResults');
        const q = query(resultsCol, orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setResults(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [catId, catsPath]);

    const handleAddResult = async () => {
        if (!newResult.testName || !newResult.result) {
            showToast("Nazwa badania i wynik są wymagane.", "error");
            return;
        }
        try {
            const resultsCol = collection(db, catsPath, catId, 'labResults');
            await addDoc(resultsCol, {...newResult, date: new Date(newResult.date)});
            setNewResult({
                testName: '',
                result: '',
                unit: '',
                referenceRange: '',
                date: new Date().toISOString().split('T')[0]
            });
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
                        {/* 2. Zastosowanie ujednoliconego stylu */}
                        <button onClick={() => setIsAdding(!isAdding)} className={`${formStyles.buttonTertiary} mb-4`}>
                            <LucidePlusCircle
                                className="mr-2 h-5 w-5"/> {isAdding ? 'Anuluj dodawanie' : 'Dodaj nowy wynik'}
                        </button>
                        {isAdding && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 space-y-3">
                                {/* 3. Zastosowanie ujednoliconych stylów dla inputów */}
                                <input value={newResult.testName}
                                       onChange={e => setNewResult({...newResult, testName: e.target.value})}
                                       placeholder="Nazwa badania (np. Kreatynina)" className={formStyles.input}/>
                                <div className="grid grid-cols-3 gap-2">
                                    <input value={newResult.result}
                                           onChange={e => setNewResult({...newResult, result: e.target.value})}
                                           placeholder="Wynik" className={formStyles.input}/>
                                    <input value={newResult.unit}
                                           onChange={e => setNewResult({...newResult, unit: e.target.value})}
                                           placeholder="Jednostka" className={formStyles.input}/>
                                    <input value={newResult.referenceRange}
                                           onChange={e => setNewResult({...newResult, referenceRange: e.target.value})}
                                           placeholder="Zakres ref." className={formStyles.input}/>
                                </div>
                                <input type="date" value={newResult.date}
                                       onChange={e => setNewResult({...newResult, date: e.target.value})}
                                       className={formStyles.input}/>
                                <div className="flex justify-end gap-2">
                                    {/* 4. Zastosowanie semantycznych stylów dla przycisków akcji */}
                                    <button onClick={() => setIsAdding(false)}
                                            className={`${formStyles.buttonCancel} w-auto text-sm px-3 py-1.5`}>Anuluj
                                    </button>
                                    <button onClick={handleAddResult}
                                            className={`${formStyles.buttonSubmit} w-auto text-sm px-3 py-1.5`}>Zapisz
                                    </button>
                                </div>
                            </div>
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
                                    <button onClick={() => handleDeleteResult(res.id)}
                                            className="p-2 text-gray-400 hover:text-red-500"><LucideTrash2 size={16}/>
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