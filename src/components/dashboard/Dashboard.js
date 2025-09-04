// /src/components/dashboard/Dashboard.js

import React, {useState, useEffect, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {signOut} from 'firebase/auth';
import {
    doc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    writeBatch,
    collection,
    getDocs,
    addDoc,
    getDoc,
    setDoc,
    arrayUnion,
    arrayRemove,
    query,
    orderBy
} from 'firebase/firestore';
import {EmailAuthProvider, reauthenticateWithCredential} from 'firebase/auth';
import {auth, db} from '../../firebase/config';
import {userCatsCollectionPath, userPrefsDocPath, foodsCollectionPath} from '../../firebase/paths';

// Importy hooków i utilów
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';
import useCollapsible from '../../hooks/useCollapsible';
import calculateDer from '../../utils/calculateDer';

// Importy komponentów podrzędnych
import CatProfile from './CatProfile';
import WeightTracker from './WeightTracker';
import Tools from './Tools';
import MealLog from './MealLog';
import HealthJournal from './HealthJournal';
import DashboardStats from './DashboardStats';
import Spinner from '../../shared/Spinner';
import ThemeSwitcher from '../../shared/ThemeSwitcher';
import {LucideCat, LucideUsers2, LucideLogOut} from 'lucide-react';

// Importy okien modalnych
import AccountSettingsModal from '../modals/AccountSettingsModal';
import FoodFormModal from '../modals/FoodFormModal';
import FoodManagementModal from '../modals/FoodManagementModal';
import StatisticsModal from '../modals/StatisticsModal';
import ExportModal from '../modals/ExportModal';
import LabResultsModal from '../modals/LabResultsModal';
import DeleteCatModal from '../modals/DeleteCatModal';
import MealFormModal from '../modals/MealFormModal';
import VetManagementModal from '../modals/VetManagementModal';
import {formStyles} from '../../utils/formStyles';


const Dashboard = () => {
    const {catId} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {showToast, theme, setTheme} = useAppContext();

    const [cat, setCat] = useState(null);
    const [foods, setFoods] = useState([]);
    const [hiddenFoodIds, setHiddenFoodIds] = useState([]);
    const [dailyData, setDailyData] = useState({meals: [], der: 0});
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    const [historicalMeals, setHistoricalMeals] = useState([]);
    const [historicalWeight, setHistoricalWeight] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isManagingFoods, setIsManagingFoods] = useState(false);
    const [isShowingStats, setIsShowingStats] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isViewingLabResults, setIsViewingLabResults] = useState(false);
    const [isDeletingCat, setIsDeletingCat] = useState(false);
    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
    const [isVetModalOpen, setIsVetModalOpen] = useState(false);
    const [foodToEdit, setFoodToEdit] = useState(null);
    const [mealToEdit, setMealToEdit] = useState(null);
    const [isAddingFood, setIsAddingFood] = useState(false);

    const profileCollapsible = useCollapsible();
    const weightCollapsible = useCollapsible();
    const toolsCollapsible = useCollapsible();
    const statsCollapsible = useCollapsible(true);
    const mealLogCollapsible = useCollapsible(true);

    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        if (!catId || !user?.uid) return;

        setLoading(true);
        const unsubCat = onSnapshot(doc(db, catsPath, catId), (doc) => {
            if (doc.exists()) {
                setCat({id: doc.id, ...doc.data()});
            } else {
                setCat(null);
                showToast("Nie znaleziono wybranego profilu kota.", "error");
                navigate('/select-cat');
            }
            setLoading(false);
        });

        const qFoods = onSnapshot(collection(db, foodsCollectionPath), (snapshot) => {
            setFoods(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
        });

        const unsubPrefs = onSnapshot(doc(db, userPrefsDocPath(user.uid)), (docSnap) => {
            setHiddenFoodIds(docSnap.data()?.hiddenFoodIds || []);
        });

        return () => {
            unsubCat();
            qFoods();
            unsubPrefs();
        };
    }, [catId, user.uid, navigate, showToast, catsPath]);

    useEffect(() => {
        if (!catId || !currentDate) return;
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        const unsubMeals = onSnapshot(mealDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setDailyData({
                    meals: data.meals || [],
                    der: data.der || 0,
                });
            } else {
                setDailyData({meals: [], der: 0});
            }
        });
        return () => unsubMeals();
    }, [catId, currentDate, catsPath]);

    useEffect(() => {
        if (!catId || !user?.uid) return;

        const fetchHistory = async () => {
            setLoadingHistory(true);

            const mealsQuery = query(collection(db, catsPath, catId, 'meals'));
            const mealsSnapshot = await getDocs(mealsQuery);
            const allMeals = mealsSnapshot.docs.flatMap(doc => (doc.data().meals || []));
            setHistoricalMeals(allMeals);

            const weightQuery = query(collection(db, catsPath, catId, 'weightLog'), orderBy('date'));
            const weightSnapshot = await getDocs(weightQuery);
            const weightData = weightSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            setHistoricalWeight(weightData);

            setLoadingHistory(false);
        };

        fetchHistory().catch(err => {
            console.error("Błąd pobierania danych historycznych:", err);
            showToast("Nie udało się pobrać danych historycznych.", "error");
            setLoadingHistory(false);
        });
    }, [catId, user.uid, catsPath, showToast]);

    const handleUpdateCat = async (updatedData) => {
        try {
            // Krok 1: Wykonaj operację zapisu w bazie danych
            await updateDoc(doc(db, catsPath, catId), updatedData);

            // Krok 2: Jeśli zapis się udał, zamknij formularz edycji
            setIsEditingProfile(false);

            // Krok 3: Pokaż komunikat o sukcesie
            showToast("Profil kota został zaktualizowany.");
        } catch (error) {
            showToast("Błąd podczas aktualizacji profilu.", "error");
        }
    };

    const handleSaveFood = async (foodData) => {
        const existingFood = foods.find(f => f.name.toLowerCase() === foodData.name.toLowerCase() && f.id !== foodToEdit?.id);
        if (existingFood) {
            showToast("Karma o tej nazwie już istnieje.", "error");
            return;
        }
        try {
            if (foodToEdit) {
                await updateDoc(doc(db, foodsCollectionPath, foodToEdit.id), foodData);
                showToast("Karma została zaktualizowana.");
            } else {
                await addDoc(collection(db, foodsCollectionPath), {...foodData, ownerId: user.uid});
                showToast("Nowa karma została dodana.");
            }
        } catch (error) {
            showToast("Wystąpił błąd zapisu.", "error");
        }
        setFoodToEdit(null);
        setIsAddingFood(false);
    };

    const handleToggleHideFood = async (foodId, isCurrentlyHidden) => {
        const prefDocRef = doc(db, userPrefsDocPath(user.uid));
        try {
            await setDoc(prefDocRef, {
                hiddenFoodIds: isCurrentlyHidden ? arrayRemove(foodId) : arrayUnion(foodId)
            }, {merge: true});
            showToast(isCurrentlyHidden ? "Karma została odkryta." : "Karma została ukryta.");
        } catch (error) {
            showToast("Wystąpił błąd.", "error");
        }
    };

    const handleDeleteFood = async (foodId) => {
        try {
            await deleteDoc(doc(db, foodsCollectionPath, foodId));
            showToast("Karma została usunięta.");
        } catch (error) {
            showToast("Nie udało się usunąć karmy.", "error");
        }
    };

    const handleAddMeal = async (mealData) => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        const newMeal = {...mealData, id: doc(collection(db, 'temp')).id, timestamp: new Date()};
        try {
            const docSnap = await getDoc(mealDocRef);
            if (docSnap.exists()) {
                await updateDoc(mealDocRef, {meals: arrayUnion(newMeal)});
            } else {
                await setDoc(mealDocRef, {meals: [newMeal], der: calculateDer(cat)});
            }
            showToast("Posiłek został dodany.");
        } catch (error) {
            showToast("Błąd dodawania posiłku.", "error");
        }
    };

    const handleUpdateMeal = async (updatedMealData) => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        try {
            const updatedMeals = dailyData.meals.map(meal =>
                meal.id === mealToEdit.id ? {...meal, ...updatedMealData} : meal
            );
            await updateDoc(mealDocRef, {meals: updatedMeals});
            setMealToEdit(null);
            showToast("Posiłek został zaktualizowany.");
        } catch (error) {
            showToast("Błąd aktualizacji posiłku.", "error");
        }
    };

    const handleDeleteMeal = async (mealId) => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        const mealToDelete = dailyData.meals.find(m => m.id === mealId);
        if (mealToDelete) {
            try {
                await updateDoc(mealDocRef, {meals: arrayRemove(mealToDelete)});
                showToast("Posiłek został usunięty.");
            } catch (error) {
                showToast("Błąd usuwania posiłku.", "error");
            }
        }
    };

    const handleConfirmDeleteCat = async (password) => {
        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            const subcollections = ['meals', 'weightLog', 'labResults', 'vetVisits', 'vaccinations', 'deworming'];
            const batch = writeBatch(db);
            for (const sub of subcollections) {
                const snapshot = await getDocs(collection(db, catsPath, catId, sub));
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
            }
            batch.delete(doc(db, catsPath, catId));
            await batch.commit();

            showToast("Profil kota został trwale usunięty.", "success");
            setIsDeletingCat(false);
            setCat(null);
            navigate('/select-cat');
            return true;
        } catch (error) {
            const msg = (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')
                ? "Nieprawidłowe hasło."
                : "Wystąpił błąd podczas usuwania.";
            showToast(msg, "error");
            return false;
        }
    };

    const visibleFoods = useMemo(() => foods.filter(food => !hiddenFoodIds.includes(food.id)), [foods, hiddenFoodIds]);

    if (loading) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"><Spinner/>
        </div>;
    }

    if (!cat) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"><p>Profil
            kota nie został znaleziony.</p></div>;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LucideCat className="h-8 w-8 text-indigo-500"/>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">{cat.name}</h1>
                        <ThemeSwitcher theme={theme} setTheme={setTheme}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/select-cat')}
                                className={formStyles.buttonSecondary + " w-auto text-sm"}>
                            <LucideUsers2 size={18} className="md:mr-2"/>
                            <span className="hidden md:inline">Zmień kota</span>
                        </button>
                        <button onClick={() => signOut(auth)}
                                className="bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 font-semibold rounded-lg transition flex items-center justify-center p-2 md:py-2 md:px-4">
                            <LucideLogOut size={18} className="md:mr-2"/>
                            <span className="hidden md:inline text-sm">Wyloguj</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* 👇 ZMIANA TUTAJ: Dodajemy `flex-col` dla RWD i `lg:grid` dla desktopa 👇 */}
            <main className="container mx-auto p-4 flex flex-col lg:grid lg:grid-cols-3 gap-6">
                {/* Lewa kolumna (na RWD będzie na dole) */}
                {/* 👇 ZMIANA TUTAJ: Dodajemy klasy `order-X` 👇 */}
                <div className="lg:col-span-1 flex flex-col gap-6 order-4 lg:order-1">
                    <div className="order-1 lg:order-1"><WeightTracker catId={catId} collapsible={weightCollapsible}/>
                    </div>
                    <div className="order-2 lg:order-2"><CatProfile cat={cat} isEditing={isEditingProfile}
                                                                    onEditToggle={setIsEditingProfile}
                                                                    onUpdate={handleUpdateCat}
                                                                    onDeleteRequest={() => setIsDeletingCat(true)}
                                                                    collapsible={profileCollapsible}/></div>
                    <div className="order-3 lg:order-3"><Tools
                        onAccountSettingsClick={() => setIsAccountSettingsOpen(true)}
                        onAddFoodClick={() => setIsAddingFood(true)} onManageFoodsClick={() => setIsManagingFoods(true)}
                        onStatsClick={() => setIsShowingStats(true)} onExportClick={() => setIsExporting(true)}
                        onLabResultsClick={() => setIsViewingLabResults(true)}
                        onManageVetsClick={() => setIsVetModalOpen(true)} collapsible={toolsCollapsible}/></div>
                </div>

                {/* Prawa kolumna (na RWD będzie na górze) */}
                {/* 👇 ZMIANA TUTAJ: Dodajemy klasy `order-X` 👇 */}
                <div className="lg:col-span-2 flex flex-col gap-6 order-1 lg:order-2">
                    <div className="order-1 lg:order-1"><DashboardStats historicalMeals={historicalMeals}
                                                                        historicalWeight={historicalWeight}
                                                                        isLoading={loadingHistory}
                                                                        collapsible={statsCollapsible}/></div>
                    <div className="order-2 lg:order-2"><MealLog cat={cat} currentDate={currentDate}
                                                                 onDateChange={(offset) => setCurrentDate(d => {
                                                                     const newDate = new Date(d);
                                                                     newDate.setUTCDate(newDate.getUTCDate() + offset);
                                                                     return newDate.toISOString().split('T')[0];
                                                                 })} dailyData={dailyData} foods={visibleFoods}
                                                                 onAddMeal={handleAddMeal} onEditMeal={setMealToEdit}
                                                                 onDeleteMeal={handleDeleteMeal}
                                                                 collapsible={mealLogCollapsible}
                                                                 currentDer={calculateDer(cat)}/></div>
                    <div className="order-3 lg:order-3"><HealthJournal catId={catId} currentDate={currentDate}/></div>
                </div>
            </main>

            {isAccountSettingsOpen && <AccountSettingsModal onCancel={() => setIsAccountSettingsOpen(false)}/>}
            {(isAddingFood || foodToEdit) && <FoodFormModal onSave={handleSaveFood} onCancel={() => {
                setIsAddingFood(false);
                setFoodToEdit(null);
            }} initialData={foodToEdit}/>}
            {isManagingFoods &&
                <FoodManagementModal foods={foods} hiddenFoodIds={hiddenFoodIds} onToggleHide={handleToggleHideFood}
                                     onCancel={() => setIsManagingFoods(false)} onEdit={(food) => {
                    setFoodToEdit(food);
                    setIsManagingFoods(false);
                }} onDelete={handleDeleteFood}/>}
            {isShowingStats && <StatisticsModal catId={catId} onCancel={() => setIsShowingStats(false)}/>}
            {isExporting && <ExportModal catId={catId} onCancel={() => setIsExporting(false)}/>}
            {isViewingLabResults && <LabResultsModal catId={catId} onCancel={() => setIsViewingLabResults(false)}/>}
            {isVetModalOpen && <VetManagementModal onCancel={() => setIsVetModalOpen(false)}/>}
            {isDeletingCat &&
                <DeleteCatModal onCancel={() => setIsDeletingCat(false)} onConfirm={handleConfirmDeleteCat}/>}
            {mealToEdit && <MealFormModal initialData={mealToEdit} foods={foods} onSave={handleUpdateMeal}
                                          onCancel={() => setMealToEdit(null)}/>}
        </div>
    );
};

export default Dashboard;