import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { userCatsCollectionPath } from '../firebase/paths';

// Importy hooków i komponentów
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import CatProfileForm from '../components/CatProfileForm';
import Spinner from './Spinner';
import { LucideCat, LucideChevronRight, LucidePlusCircle, LucideLogOut } from 'lucide-react';
import {typographyStyles} from "../utils/formStyles";

const CatSelection = () => {
    // Pobieramy dane globalne
    const { user } = useAuth();
    const { showToast, theme } = useAppContext();
    const navigate = useNavigate();

    // Stany lokalne, przeniesione z MainApp
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingCat, setIsCreatingCat] = useState(false);

    // Efekt do pobierania listy kotów
    useEffect(() => {
        if (!user?.uid) return;

        setLoading(true);
        const q = query(collection(db, userCatsCollectionPath(user.uid)));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const catsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCats(catsData);
            setLoading(false);
        }, (error) => {
            console.error("Błąd pobierania profili kotów:", error);
            showToast("Nie udało się pobrać profili kotów.", "error");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user.uid, showToast]);

    // Funkcja do tworzenia nowego kota
    const handleCreateCat = async (newCatData) => {
        try {
            await addDoc(collection(db, userCatsCollectionPath(user.uid)), {
                ...newCatData,
                ownerId: user.uid
            });
            setIsCreatingCat(false);
            showToast("Profil kota został pomyślnie utworzony!");
        } catch (error) {
            showToast("Nie udało się utworzyć profilu.", "error");
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-center mb-6">
                    <LucideCat className="h-12 w-12 text-indigo-500" />
                    <h1 className={`${typographyStyles.h1} ml-4`}>Dziennik Kota</h1>
                </div>
                <h2 className="text-xl text-center text-gray-600 dark:text-gray-300 mb-8">Wybierz profil lub stwórz nowy</h2>

                {cats.length > 0 && (
                    <div className="space-y-3 mb-6">
                        {cats.map(cat => (
                            <button key={cat.id} onClick={() => navigate(`/dashboard/${cat.id}`)} className="w-full flex items-center text-left bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 p-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <div className="p-2 bg-indigo-200 dark:bg-indigo-800 rounded-full">
                                    <LucideCat className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                                </div>
                                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 ml-4">{cat.name}</span>
                                <LucideChevronRight className="ml-auto h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </button>
                        ))}
                    </div>
                )}

                {isCreatingCat ? (
                    <CatProfileForm onSave={handleCreateCat} onCancel={() => setIsCreatingCat(false)} theme={theme} />
                ) : (
                    <button onClick={() => setIsCreatingCat(true)} className="w-full flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">
                        <LucidePlusCircle className="mr-2 h-5 w-5" />
                        Stwórz Nowy Profil Kota
                    </button>
                )}
                <button onClick={() => signOut(auth)} className="w-full mt-4 text-sm text-gray-500 hover:text-indigo-500 flex items-center justify-center">
                    <LucideLogOut size={16} className="mr-2"/> Wyloguj się
                </button>
            </div>
        </div>
    );
};

export default CatSelection;