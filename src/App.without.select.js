import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, onSnapshot, query, updateDoc, arrayUnion, arrayRemove, getDocs, deleteDoc, writeBatch, orderBy, where, addDoc } from 'firebase/firestore';
import Select from 'react-select'; // Import biblioteki react-select
import { LucideCat, LucidePlusCircle, LucideChevronRight, LucideFlame, LucideBone, LucideClipboardEdit, LucideTrash2, LucideSave, LucideX, LucideBookUser, LucideSprout, LucideWeight, LucideTarget, LucideCalendarDays, LucideActivity, LucideInfo, LucideAlertTriangle, LucideList, LucideChevronLeft, LucideLineChart, LucideBarChart3, LucideCheckCircle, LucideAlertCircle, LucideDownload, LucideNotebookText, LucideHeartPulse, LucideStethoscope, LucideDroplets, LucidePill, LucideTag, LucideTestTube, LucideLogOut, LucideSun, LucideMoon, LucideLaptop } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Konfiguracja Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCWLLc_kTrKkVIYymPRHhWehoa-P7mw4wY",
    authDomain: "cat-calculator-dd26f.firebaseapp.com",
    projectId: "cat-calculator-dd26f",
    storageBucket: "cat-calculator-dd26f.firebasestorage.app",
    messagingSenderId: "869938257249",
    appId: "1:869938257249:web:3c0def8fb96f034e277920",
    measurementId: "G-8PJVDQNXSZ"
};


// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cat-nutrition-default';

// --- Inicjalizacja Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Główne ścieżki w Firestore ---
const userCatsCollectionPath = (userId) => `artifacts/${appId}/users/${userId}/cats`;
const foodsCollectionPath = `artifacts/${appId}/public/data/foods`;

// --- Funkcja pomocnicza do obliczania DER ---
const calculateDer = (catProfile) => {
    if (!catProfile) return 0;
    const weight = catProfile.targetWeight > 0 ? catProfile.targetWeight : catProfile.currentWeight;
    if (weight <= 0) return 0;
    const rer = 70 * Math.pow(weight, 0.75);
    let finalDer;

    switch (catProfile.chronicDisease) {
        case 'nadczynnosc_tarczycy': finalDer = rer * 1.5; break;
        case 'choroba_nerek': finalDer = rer * 1.0; break;
        case 'cukrzyca': finalDer = rer * 1.2; break;
        case 'choroby_serca': finalDer = rer * 1.3; break;
        case 'choroby_drog_moczowych': finalDer = rer * 0.8; break;
        case 'zapalenie_trzustki': finalDer = rer * 1.1; break;
        case 'nieswoiste_zapalenie_jelit': finalDer = rer * 1.2; break;
        case 'brak':
        default:
            switch (catProfile.physiologicalState) {
                case 'ciaza': finalDer = rer * 2.0; break;
                case 'laktacja': finalDer = rer * 3.5; break;
                case 'rekonwalescencja': finalDer = rer * 1.3; break;
                case 'normalny':
                default:
                    const age = catProfile.age || 1;
                    let modifier;

                    if (age < 0.33) { modifier = 3.0; }
                    else if (age < 1) { modifier = 2.5; }
                    else if (age > 7) { modifier = catProfile.isNeutered ? 1.0 : 1.2; }
                    else { modifier = catProfile.isNeutered ? 1.2 : 1.4; }

                    if (catProfile.currentWeight > catProfile.targetWeight && catProfile.targetWeight > 0) {
                        modifier = 0.8;
                    } else if (catProfile.currentWeight < catProfile.targetWeight && catProfile.targetWeight > 0) {
                        modifier = 1.4;
                    } else {
                        if (catProfile.activityLevel === 'wysoki') modifier *= 1.2;
                        if (catProfile.activityLevel === 'niski') modifier *= 0.8;
                    }
                    finalDer = rer * modifier;
            }
    }

    let breedModifier = 1.0;
    switch (catProfile.breed) {
        case 'sfinks': breedModifier = 1.2; break;
        case 'bengalski': breedModifier = 1.1; break;
        case 'brytyjski': breedModifier = 0.95; break;
        case 'ragdoll': breedModifier = 0.95; break;
        default: breedModifier = 1.0;
    }

    return Math.round(finalDer * breedModifier);
};

// --- Komponenty UI ---
const Spinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
);

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseStyle = "fixed top-20 right-5 p-4 rounded-lg shadow-lg flex items-center text-white transition-opacity duration-300 z-50";
    const typeStyles = {
        success: "bg-green-500",
        error: "bg-red-500"
    };

    return (
        <div className={`${baseStyle} ${typeStyles[type]}`}>
            {type === 'success' ? <LucideCheckCircle className="mr-3" /> : <LucideAlertCircle className="mr-3" />}
            {message}
            <button onClick={onClose} className="ml-4 font-bold">
                <LucideX size={20} />
            </button>
        </div>
    );
};

const ThemeSwitcher = ({ theme, setTheme }) => {
    const themes = [
        { name: 'light', icon: LucideSun },
        { name: 'dark', icon: LucideMoon },
        { name: 'system', icon: LucideLaptop },
    ];

    return (
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            {themes.map(t => (
                <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`p-2 rounded-md transition-colors ${theme === t.name ? 'bg-white dark:bg-gray-900 text-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    aria-label={`Switch to ${t.name} theme`}
                >
                    <t.icon size={16} />
                </button>
            ))}
        </div>
    );
};

// --- Główny komponent aplikacji ---
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            localStorage.setItem('theme', theme);
        };

        applyTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [theme]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type, id: Date.now() });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"><Spinner /></div>;
    }

    return (
        <>
            {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {user ? <MainApp user={user} showToast={showToast} theme={theme} setTheme={setTheme} /> : <AuthPage showToast={showToast} />}
        </>
    );
};

const AuthPage = ({ showToast }) => {
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Zalogowano pomyślnie!");
            } else if (authMode === 'register') {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast("Konto zostało utworzone!");
            } else if (authMode === 'reset') {
                await sendPasswordResetEmail(auth, email);
                showToast("Link do resetu hasła został wysłany na Twój e-mail.");
                setAuthMode('login');
            }
        } catch (err) {
            let errorMessage = "Wystąpił nieoczekiwany błąd.";
            switch (err.code) {
                case 'auth/invalid-email': errorMessage = "Nieprawidłowy format adresu e-mail."; break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential': errorMessage = "Nieprawidłowy e-mail lub hasło."; break;
                case 'auth/email-already-in-use': errorMessage = "Ten adres e-mail jest już zajęty."; break;
                case 'auth/weak-password': errorMessage = "Hasło musi mieć co najmniej 6 znaków."; break;
                case 'auth/operation-not-allowed': errorMessage = "Logowanie e-mailem i hasłem jest wyłączone dla tej aplikacji."; break;
                default: console.error("Auth Error:", err);
            }
            setError(errorMessage);
            showToast(errorMessage, "error");
        }
    };

    const renderForm = () => {
        if (authMode === 'reset') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">Resetuj hasło</h2>
                    <form onSubmit={handleAuthAction} className="space-y-4">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adres e-mail" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg">Wyślij link</button>
                    </form>
                    <button onClick={() => setAuthMode('login')} className="w-full mt-4 text-sm text-indigo-500 hover:underline">Wróć do logowania</button>
                </>
            );
        }

        return (
            <>
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">{authMode === 'login' ? 'Logowanie' : 'Rejestracja'}</h2>
                <form onSubmit={handleAuthAction} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adres e-mail" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg">
                        {authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                    </button>
                </form>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-indigo-500 hover:underline">
                        {authMode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
                    </button>
                    {authMode === 'login' && <button onClick={() => setAuthMode('reset')} className="text-sm text-gray-500 hover:underline">Zapomniałeś hasła?</button>}
                </div>
            </>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-center mb-6">
                    <LucideCat className="h-12 w-12 text-indigo-500" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 ml-4">Dziennik Kota</h1>
                </div>
                {renderForm()}
            </div>
        </div>
    );
};

const MainApp = ({ user, showToast, theme, setTheme }) => {
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [cats, setCats] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [isCreatingCat, setIsCreatingCat] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    useEffect(() => {
        setLoadingCats(true);
        const q = query(collection(db, userCatsCollectionPath(user.uid)));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const catsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCats(catsData);
            setLoadingCats(false);
        }, (error) => {
            console.error("Błąd pobierania profili kotów:", error);
            setLoadingCats(false);
        });
        return () => unsubscribe();
    }, [user.uid]);

    useEffect(() => {
        if (!loadingCats && !initialCheckDone && cats.length === 1) {
            setSelectedCatId(cats[0].id);
            setInitialCheckDone(true);
        }
    }, [loadingCats, cats, initialCheckDone]);

    const handleCreateCat = async (newCatData) => {
        try {
            await addDoc(collection(db, userCatsCollectionPath(user.uid)), { ...newCatData, ownerId: user.uid });
            setIsCreatingCat(false);
            showToast("Profil kota został pomyślnie utworzony!");
        } catch (error) {
            showToast("Nie udało się utworzyć profilu.", "error");
        }
    };

    if (loadingCats) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (!selectedCatId) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <div className="flex items-center justify-center mb-6">
                        <LucideCat className="h-12 w-12 text-indigo-500" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 ml-4">Dziennik Kota</h1>
                    </div>
                    <h2 className="text-xl text-center text-gray-600 dark:text-gray-300 mb-8">Wybierz profil lub stwórz nowy</h2>

                    {cats.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {cats.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedCatId(cat.id)} className="w-full flex items-center text-left bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 p-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
                        <CatProfileForm onSave={handleCreateCat} onCancel={() => setIsCreatingCat(false)} />
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
    }

    return <Dashboard catId={selectedCatId} onBack={() => setSelectedCatId(null)} showToast={showToast} user={user} theme={theme} setTheme={setTheme} />;
};


// --- Komponent Dashboardu ---
const Dashboard = ({ catId, onBack, showToast, user, theme, setTheme }) => {
    const [cat, setCat] = useState(null);
    const [foods, setFoods] = useState([]);
    const [dailyData, setDailyData] = useState({ meals: [], der: 0, note: '', waterIntake: '', medications: '', symptomTags: [] });
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isManagingFoods, setIsManagingFoods] = useState(false);
    const [isShowingStats, setIsShowingStats] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isViewingLabResults, setIsViewingLabResults] = useState(false);
    const [foodToEdit, setFoodToEdit] = useState(null);
    const [mealToEdit, setMealToEdit] = useState(null);
    const [isAddingFood, setIsAddingFood] = useState(false);

    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        setLoading(true);
        const unsubCat = onSnapshot(doc(db, catsPath, catId), (doc) => {
            if (doc.exists()) {
                setCat({ id: doc.id, ...doc.data() });
            }
            setLoading(false);
        });

        const qFoods = query(collection(db, foodsCollectionPath));
        const unsubFoods = onSnapshot(qFoods, (snapshot) => {
            const foodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFoods(foodsData);
        });

        return () => {
            unsubCat();
            unsubFoods();
        };
    }, [catId, catsPath]);

    useEffect(() => {
        if (!catId || !currentDate) return;

        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        const unsubMeals = onSnapshot(mealDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setDailyData({
                    meals: data.meals || [],
                    der: data.der || 0,
                    note: data.note || '',
                    waterIntake: data.waterIntake || '',
                    medications: data.medications || '',
                    symptomTags: data.symptomTags || []
                });
            } else {
                setDailyData({ meals: [], der: 0, note: '', waterIntake: '', medications: '', symptomTags: [] });
            }
        });

        return () => unsubMeals();
    }, [catId, currentDate, catsPath]);

    const handleDateChange = (offset) => {
        const date = new Date(currentDate);
        date.setUTCDate(date.getUTCDate() + offset);
        setCurrentDate(date.toISOString().split('T')[0]);
    };

    const handleUpdateCat = async (updatedData) => {
        const catRef = doc(db, catsPath, catId);
        try {
            await updateDoc(catRef, updatedData);
            setIsEditingProfile(false);
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
                const foodRef = doc(db, foodsCollectionPath, foodToEdit.id);
                await updateDoc(foodRef, foodData);
                showToast("Karma została zaktualizowana.");
            } else {
                await addDoc(collection(db, foodsCollectionPath), foodData);
                showToast("Nowa karma została dodana.");
            }
        } catch(error) {
            showToast("Wystąpił błąd zapisu.", "error");
        }
        setFoodToEdit(null);
        setIsAddingFood(false);
    };

    const handleEditFood = (food) => {
        setFoodToEdit(food);
        setIsManagingFoods(false);
    };

    const handleDeleteFood = async (foodId) => {
        try {
            const foodRef = doc(db, foodsCollectionPath, foodId);
            await deleteDoc(foodRef);
            showToast("Karma została usunięta.");
        } catch(error) {
            showToast("Nie udało się usunąć karmy.", "error");
        }
    };

    const handleAddMeal = async (mealData) => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        const newMeal = { ...mealData, id: crypto.randomUUID(), timestamp: new Date() };
        try {
            const docSnap = await getDoc(mealDocRef);
            if (docSnap.exists()) {
                await updateDoc(mealDocRef, { meals: arrayUnion(newMeal) });
            } else {
                const currentDer = calculateDer(cat);
                await setDoc(mealDocRef, {
                    meals: [newMeal],
                    der: currentDer,
                    note: '',
                    waterIntake: '',
                    medications: '',
                    symptomTags: []
                });
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
                meal.id === mealToEdit.id ? { ...meal, ...updatedMealData } : meal
            );
            await updateDoc(mealDocRef, { meals: updatedMeals });
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
                await updateDoc(mealDocRef, { meals: arrayRemove(mealToDelete) });
                showToast("Posiłek został usunięty.");
            } catch (error) {
                showToast("Błąd usuwania posiłku.", "error");
            }
        }
    };

    const currentDer = useMemo(() => calculateDer(cat), [cat]);
    const dayDer = dailyData.der > 0 ? dailyData.der : currentDer;
    const meals = dailyData.meals;
    const totalCaloriesToday = useMemo(() => meals.reduce((sum, meal) => sum + meal.calories, 0), [meals]);
    const calorieProgress = dayDer > 0 ? (totalCaloriesToday / dayDer) * 100 : 0;

    if (loading) return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"><Spinner /></div>;
    if (!cat) return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"><p>Nie znaleziono kota. <button onClick={onBack} className="text-indigo-500">Wróć</button></p></div>;

    const physiologicalStateText = {
        normalny: 'Normalny',
        ciaza: 'Ciąża',
        laktacja: 'Laktacja',
        rekonwalescencja: 'Rekonwalescencja'
    };

    const chronicDiseaseText = {
        brak: 'Brak',
        nadczynnosc_tarczycy: 'Nadczynność tarczycy',
        choroba_nerek: 'Choroba nerek',
        cukrzyca: 'Cukrzyca',
        choroby_serca: 'Choroby serca',
        choroby_drog_moczowych: 'Choroby dróg moczowych',
        zapalenie_trzustki: 'Zapalenie trzustki',
        nieswoiste_zapalenie_jelit: 'Nieswoiste zapalenie jelit'
    };

    const breedText = {
        mieszany: 'Mieszany / Inny',
        europejski: 'Europejski krótkowłosy',
        brytyjski: 'Brytyjski krótkowłosy',
        maine_coon: 'Maine Coon',
        ragdoll: 'Ragdoll',
        syberyjski: 'Syberyjski',
        bengalski: 'Bengalski',
        sfinks: 'Sfinks'
    };

    const formatAgeText = (age) => {
        if (!age && age !== 0) return 'Brak danych';
        if (age < 1) {
            const months = Math.round(age * 12);
            return `${months} mies. (Kocię)`;
        }
        const years = Math.floor(age);
        if (years > 7) return `${years} lat (Senior)`;
        return `${years} lat (Dorosły)`;
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LucideCat className="h-8 w-8 text-indigo-500" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{cat.name}</h1>
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition">Zmień kota</button>
                        <button onClick={() => signOut(auth)} className="text-sm bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 font-semibold py-2 px-4 rounded-lg transition flex items-center">
                            <LucideLogOut size={16} className="mr-2"/> Wyloguj
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {isEditingProfile ? (
                        <CatProfileForm cat={cat} onSave={handleUpdateCat} onCancel={() => setIsEditingProfile(false)} />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center"><LucideBookUser className="mr-2 h-6 w-6 text-indigo-500"/> Profil kota</h2>
                                <button onClick={() => setIsEditingProfile(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"><LucideClipboardEdit className="h-5 w-5" /></button>
                            </div>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                <p className="flex items-center"><LucideCat className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Rasa:</strong> <span className="ml-auto font-medium">{breedText[cat.breed] || 'Inny'}</span></p>
                                <p className="flex items-center"><LucideWeight className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Aktualna waga:</strong> <span className="ml-auto font-medium">{cat.currentWeight} kg</span></p>
                                <p className="flex items-center"><LucideTarget className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Docelowa waga:</strong> <span className="ml-auto font-medium">{cat.targetWeight > 0 ? `${cat.targetWeight} kg` : 'Brak'}</span></p>
                                <p className="flex items-center"><LucideSprout className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Wiek:</strong> <span className="ml-auto font-medium">{formatAgeText(cat.age)}</span></p>
                                <p className="flex items-center"><LucideBone className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Kastracja:</strong> <span className="ml-auto font-medium">{cat.isNeutered ? 'Tak' : 'Nie'}</span></p>
                                <p className="flex items-center"><LucideActivity className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Aktywność:</strong> <span className="ml-auto font-medium capitalize">{cat.activityLevel}</span></p>
                                <p className="flex items-center"><LucideHeartPulse className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Stan fizjologiczny:</strong> <span className="ml-auto font-medium">{physiologicalStateText[cat.physiologicalState] || 'Normalny'}</span></p>
                                <p className="flex items-center"><LucideStethoscope className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"/> <strong>Choroba przewlekła:</strong> <span className="ml-auto font-medium">{chronicDiseaseText[cat.chronicDisease] || 'Brak'}</span></p>
                            </div>
                        </div>
                    )}

                    <WeightTracker catId={catId} user={user} showToast={showToast} />

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center"><LucideBone className="mr-2 h-6 w-6 text-indigo-500"/>Narzędzia</h2>
                        <div className="space-y-2">
                            <button onClick={() => setIsAddingFood(true)} className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                                <LucidePlusCircle className="mr-2 h-5 w-5" /> Dodaj nową karmę
                            </button>
                            <button onClick={() => setIsManagingFoods(true)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                                <LucideList className="mr-2 h-5 w-5" /> Zarządzaj karmami
                            </button>
                            <button onClick={() => setIsShowingStats(true)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                                <LucideBarChart3 className="mr-2 h-5 w-5" /> Pokaż statystyki
                            </button>
                            <button onClick={() => setIsExporting(true)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                                <LucideDownload className="mr-2 h-5 w-5" /> Eksportuj dane
                            </button>
                            <button onClick={() => setIsViewingLabResults(true)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center">
                                <LucideTestTube className="mr-2 h-5 w-5" /> Wyniki badań
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><LucideCalendarDays className="mr-2 h-6 w-6 text-indigo-500"/> Dziennik Posiłków</h2>
                        <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                <LucideChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-center">
                                {new Date(currentDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                <LucideChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        {cat && cat.chronicDisease !== 'brak' && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow mb-4">
                                <div className="flex"><div className="py-1"><LucideAlertTriangle className="h-6 w-6 text-red-500 mr-4"/></div><div><p className="font-bold">Ważne!</p><p className="text-sm">Wybrano chorobę przewlekłą. Pamiętaj, że dieta kota musi być bezwzględnie skonsultowana z lekarzem weterynarii.</p></div></div>
                            </div>
                        )}
                        <div className="mb-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className={`h-4 rounded-full transition-all duration-500 ${calorieProgress > 100 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(calorieProgress, 100)}%` }}></div></div>
                            <div className="flex justify-between text-sm mt-1"><span className="font-medium text-gray-700 dark:text-gray-300">{Math.round(totalCaloriesToday)} kcal</span><span className="font-medium text-gray-500 dark:text-gray-400">{dayDer} kcal</span></div>
                            {calorieProgress > 100 && (<p className="text-center text-sm font-semibold text-red-600 mt-2">Przekroczono zapotrzebowanie o {Math.round(totalCaloriesToday - dayDer)} kcal!</p>)}
                        </div>
                        <AddMealForm foods={foods} onSave={handleAddMeal} />
                        <div className="mt-6 space-y-3">
                            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Posiłki z wybranego dnia:</h3>
                            {meals.length > 0 ? (
                                meals.sort((a,b) => new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000)).map(meal => (
                                    <div key={meal.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <div><p className="font-semibold text-gray-800 dark:text-gray-200">{meal.foodName}</p><p className="text-sm text-gray-500 dark:text-gray-400">{meal.weight}g &bull; {Math.round(meal.calories)} kcal</p></div>
                                        <div className="flex items-center space-x-1">
                                            <button onClick={() => setMealToEdit(meal)} className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-600 transition"><LucideClipboardEdit className="h-4 w-4" /></button>
                                            <button onClick={() => handleDeleteMeal(meal.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition"><LucideTrash2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (<p className="text-center text-gray-500 dark:text-gray-400 py-4">Brak posiłków w tym dniu.</p>)}
                        </div>
                    </div>
                    <DailyHealthLog catId={catId} user={user} currentDate={currentDate} initialData={dailyData} showToast={showToast} />
                </div>
            </main>

            {(isAddingFood || foodToEdit) && <FoodFormModal onSave={handleSaveFood} onCancel={() => { setIsAddingFood(false); setFoodToEdit(null); }} initialData={foodToEdit} />}
            {isManagingFoods && <FoodManagementModal foods={foods} onCancel={() => setIsManagingFoods(false)} onEdit={handleEditFood} onDelete={handleDeleteFood} />}
            {isShowingStats && <StatisticsModal catId={catId} user={user} onCancel={() => setIsShowingStats(false)} />}
            {isExporting && <ExportModal catId={catId} user={user} onCancel={() => setIsExporting(false)} showToast={showToast} />}
            {isViewingLabResults && <LabResultsModal catId={catId} user={user} onCancel={() => setIsViewingLabResults(false)} showToast={showToast} />}
            {mealToEdit && <AddMealForm isEditMode initialData={mealToEdit} foods={foods} onSave={handleUpdateMeal} onCancel={() => setMealToEdit(null)} />}
        </div>
    );
};


// --- Nowe komponenty ---
const WeightTracker = ({ catId, user, showToast }) => {
    const [weightLog, setWeightLog] = useState([]);
    const [newWeight, setNewWeight] = useState('');
    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        const logCollection = collection(db, catsPath, catId, 'weightLog');
        const q = query(logCollection);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(),
                date: doc.data().date.toDate()
            })).sort((a, b) => a.date - b.date);
            setWeightLog(data);
        });

        return () => unsubscribe();
    }, [catId, catsPath]);

    const handleAddWeight = async (e) => {
        e.preventDefault();
        if (!newWeight || parseFloat(newWeight) <= 0) {
            showToast("Proszę podać prawidłową wagę.", "error");
            return;
        }

        try {
            const weightLogRef = doc(collection(db, catsPath, catId, 'weightLog'));
            await setDoc(weightLogRef, {
                weight: parseFloat(newWeight),
                date: new Date()
            });

            const catRef = doc(db, catsPath, catId);
            await updateDoc(catRef, {
                currentWeight: parseFloat(newWeight)
            });
            showToast("Waga została zaktualizowana.");
            setNewWeight('');
        } catch (error) {
            showToast("Błąd zapisu wagi.", "error");
        }
    };

    const formattedData = weightLog.map(log => ({
        date: log.date.toLocaleDateString('pl-PL'),
        waga: log.weight
    }));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center"><LucideLineChart className="mr-2 h-6 w-6 text-indigo-500"/> Historia wagi</h2>
            <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" fontSize={12} tick={{ fill: '#6b7280' }} />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} unit="kg" fontSize={12} tick={{ fill: '#6b7280' }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#e5e7eb', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="waga" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <form onSubmit={handleAddWeight} className="mt-4 flex items-center gap-2">
                <input
                    type="number"
                    step="0.01"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="Nowa waga (kg)"
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm">Zapisz</button>
            </form>
        </div>
    );
};

const StatisticsModal = ({ catId, user, onCancel }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const mealsCol = collection(db, catsPath, catId, 'meals');
            const allMeals = [];

            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                const mealDoc = await getDoc(doc(mealsCol, dateString));
                if (mealDoc.exists()) {
                    allMeals.push(...mealDoc.data().meals);
                }
            }

            if (allMeals.length === 0) {
                setStats({ avgCalories: 0, foodTypeDistribution: [], topFoods: [] });
                setLoading(false);
                return;
            }

            const totalCalories = allMeals.reduce((sum, meal) => sum + meal.calories, 0);
            const avgCalories = totalCalories / 30;

            const foodTypeDistribution = allMeals.reduce((acc, meal) => {
                const type = meal.foodType || 'nieznany';
                acc[type] = (acc[type] || 0) + meal.weight;
                return acc;
            }, {});

            const foodTypeData = Object.keys(foodTypeDistribution).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: foodTypeDistribution[key]
            }));

            const foodFrequency = allMeals.reduce((acc, meal) => {
                acc[meal.foodName] = (acc[meal.foodName] || 0) + 1;
                return acc;
            }, {});

            const topFoods = Object.entries(foodFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, count]) => ({ name, count }));

            setStats({ avgCalories, foodTypeDistribution: foodTypeData, topFoods });
            setLoading(false);
        };

        fetchStats();
    }, [catId, catsPath]);

    const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up flex flex-col" style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Statystyki z ostatnich 30 dni</h2>
                    <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX /></button>
                </div>
                {loading ? <Spinner /> : (
                    <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Średnie dzienne spożycie</h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(stats.avgCalories)} <span className="text-lg font-normal">kcal</span></p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Najczęściej podawane karmy</h3>
                            {stats.topFoods.length > 0 ? (
                                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                                    {stats.topFoods.map(food => (
                                        <li key={food.name} className="flex justify-between">
                                            <span>{food.name}</span>
                                            <span className="font-semibold">{food.count} razy</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500 dark:text-gray-400">Brak danych.</p>}
                        </div>
                        <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-center">Podział karm (wg wagi)</h3>
                            {stats.foodTypeDistribution.length > 0 ? (
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.foodTypeDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {stats.foodTypeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value.toFixed(1)}g`} contentStyle={{ backgroundColor: '#1f2937', color: '#e5e7eb', border: 'none', borderRadius: '0.5rem' }}/>
                                            <Legend wrapperStyle={{color: '#e5e7eb'}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : <p className="text-sm text-center text-gray-500 dark:text-gray-400">Brak danych do wyświetlenia wykresu.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DailyHealthLog = ({ catId, user, currentDate, initialData, showToast }) => {
    const [healthData, setHealthData] = useState(initialData);
    const [isEditing, setIsEditing] = useState(false);
    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        setHealthData(initialData);
    }, [initialData]);

    const handleSave = async () => {
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        try {
            const docSnap = await getDoc(mealDocRef);
            const dataToSave = {
                note: healthData.note || '',
                waterIntake: Number(healthData.waterIntake) || 0,
                medications: healthData.medications || '',
                symptomTags: healthData.symptomTags || []
            };
            if (docSnap.exists()) {
                await updateDoc(mealDocRef, dataToSave);
            } else {
                await setDoc(mealDocRef, { ...dataToSave, meals: [], der: 0 });
            }
            showToast("Dziennik zdrowia został zapisany.");
            setIsEditing(false);
        } catch (error) {
            showToast("Błąd zapisu dziennika zdrowia.", "error");
        }
    };

    const handleTagToggle = (tag) => {
        const newTags = healthData.symptomTags.includes(tag)
            ? healthData.symptomTags.filter(t => t !== tag)
            : [...healthData.symptomTags, tag];
        setHealthData(prev => ({ ...prev, symptomTags: newTags }));
    };

    const symptomOptions = ["wymioty", "biegunka", "apatia", "brak apetytu", "kaszel", "kichanie"];

    if (!isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg" onClick={() => setIsEditing(true)}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center cursor-pointer"><LucideNotebookText className="mr-2 h-6 w-6 text-indigo-500"/> Dziennik Zdrowia</h2>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong className="flex items-center"><LucideDroplets size={16} className="mr-2"/>Spożycie wody:</strong> {healthData.waterIntake || '0'} ml</p>
                    <p><strong className="flex items-center"><LucidePill size={16} className="mr-2"/>Leki/Suplementy:</strong> {healthData.medications || 'Brak'}</p>
                    <p><strong className="flex items-center"><LucideTag size={16} className="mr-2"/>Objawy:</strong> {healthData.symptomTags.length > 0 ? healthData.symptomTags.join(', ') : 'Brak'}</p>
                    <p><strong className="flex items-center"><LucideNotebookText size={16} className="mr-2"/>Notatki:</strong> {healthData.note || 'Brak'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center"><LucideNotebookText className="mr-2 h-6 w-6 text-indigo-500"/> Dziennik Zdrowia</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucideDroplets size={16} className="mr-2"/>Spożycie wody (ml)</label>
                    <input type="number" value={healthData.waterIntake} onChange={(e) => setHealthData(p => ({...p, waterIntake: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucidePill size={16} className="mr-2"/>Leki / Suplementy</label>
                    <textarea value={healthData.medications} onChange={(e) => setHealthData(p => ({...p, medications: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm h-16 bg-white dark:bg-gray-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucideTag size={16} className="mr-2"/>Obserwowane objawy</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {symptomOptions.map(tag => (
                            <button key={tag} onClick={() => handleTagToggle(tag)} className={`px-2 py-1 text-xs rounded-full ${healthData.symptomTags.includes(tag) ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><LucideNotebookText size={16} className="mr-2"/>Notatki ogólne</label>
                    <textarea value={healthData.note} onChange={(e) => setHealthData(p => ({...p, note: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm h-20 bg-white dark:bg-gray-700" />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Anuluj</button>
                    <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Zapisz</button>
                </div>
            </div>
        </div>
    );
};

const LabResultsModal = ({ catId, user, onCancel, showToast }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newResult, setNewResult] = useState({ testName: '', result: '', unit: '', referenceRange: '', date: new Date().toISOString().split('T')[0] });
    const catsPath = userCatsCollectionPath(user.uid);

    useEffect(() => {
        const resultsCol = collection(db, catsPath, catId, 'labResults');
        const q = query(resultsCol, orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
            await addDoc(resultsCol, { ...newResult, date: new Date(newResult.date) });
            setNewResult({ testName: '', result: '', unit: '', referenceRange: '', date: new Date().toISOString().split('T')[0] });
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in-up flex flex-col" style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Wyniki badań laboratoryjnych</h2>
                    <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX /></button>
                </div>
                {loading ? <Spinner /> : (
                    <div className="flex-grow overflow-y-auto pr-2">
                        <button onClick={() => setIsAdding(true)} className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center mb-4">
                            <LucidePlusCircle className="mr-2 h-5 w-5" /> Dodaj nowy wynik
                        </button>
                        {isAdding && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 space-y-3">
                                <input value={newResult.testName} onChange={e => setNewResult({...newResult, testName: e.target.value})} placeholder="Nazwa badania (np. Kreatynina)" className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"/>
                                <div className="grid grid-cols-3 gap-2">
                                    <input value={newResult.result} onChange={e => setNewResult({...newResult, result: e.target.value})} placeholder="Wynik" className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"/>
                                    <input value={newResult.unit} onChange={e => setNewResult({...newResult, unit: e.target.value})} placeholder="Jednostka" className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"/>
                                    <input value={newResult.referenceRange} onChange={e => setNewResult({...newResult, referenceRange: e.target.value})} placeholder="Zakres ref." className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"/>
                                </div>
                                <input type="date" value={newResult.date} onChange={e => setNewResult({...newResult, date: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"/>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded">Anuluj</button>
                                    <button onClick={handleAddResult} className="bg-indigo-500 text-white px-3 py-1 rounded">Zapisz</button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            {results.map(res => (
                                <div key={res.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{res.testName}: <span className="font-normal">{res.result} {res.unit}</span></p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Zakres ref.: {res.referenceRange} | Data: {res.date.toDate().toLocaleDateString('pl-PL')}</p>
                                    </div>
                                    <button onClick={() => handleDeleteResult(res.id)} className="p-2 text-gray-400 hover:text-red-500"><LucideTrash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Komponenty formularzy i modali ---
const CatProfileForm = ({ cat, onSave, onCancel }) => {
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

    const handleChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };

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

    return (<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in"><form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300"><h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{cat ? 'Edytuj profil' : 'Stwórz nowy profil'}</h2><div><label className="block text-sm font-medium">Nazwa kota</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium">Aktualna waga (kg)</label><input type="number" step="0.1" name="currentWeight" value={formData.currentWeight} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required /></div><div><label className="block text-sm font-medium">Docelowa waga (kg)</label><input type="number" step="0.1" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" placeholder="Opcjonalnie" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium">Wiek (lata)</label><input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" min="0" required /></div>{parseInt(years, 10) === 0 && (<div><label className="block text-sm font-medium">Miesiące</label><input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" min="0" max="11" required /></div>)}</div><div><label className="block text-sm font-medium">Rasa</label><select name="breed" value={formData.breed} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"><option value="mieszany">Mieszany / Inny</option><option value="europejski">Europejski krótkowłosy</option><option value="brytyjski">Brytyjski krótkowłosy</option><option value="maine_coon">Maine Coon</option><option value="ragdoll">Ragdoll</option><option value="syberyjski">Syberyjski</option><option value="bengalski">Bengalski</option><option value="sfinks">Sfinks</option></select></div><div><label className="block text-sm font-medium">Poziom aktywności</label><select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"><option value="niski">Niski (kot niewychodzący)</option><option value="umiarkowany">Umiarkowany (kot wychodzący)</option><option value="wysoki">Wysoki (bardzo aktywny)</option></select></div><div><label className="block text-sm font-medium">Stan fizjologiczny</label><select name="physiologicalState" value={formData.physiologicalState} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"><option value="normalny">Normalny</option><option value="ciaza">Ciąża</option><option value="laktacja">Laktacja</option><option value="rekonwalescencja">Rekonwalescencja</option></select></div><div><label className="block text-sm font-medium">Choroba przewlekła</label><select name="chronicDisease" value={formData.chronicDisease} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"><option value="brak">Brak</option><option value="nadczynnosc_tarczycy">Nadczynność tarczycy</option><option value="choroba_nerek">Przewlekła choroba nerek</option><option value="cukrzyca">Cukrzyca</option><option value="choroby_serca">Choroby serca</option><option value="choroby_drog_moczowych">Choroby dolnych dróg moczowych (FLUTD)</option><option value="zapalenie_trzustki">Zapalenie trzustki</option><option value="nieswoiste_zapalenie_jelit">Nieswoiste zapalenie jelit (IBD)</option></select></div><div className="flex items-center"><input type="checkbox" id="isNeutered" name="isNeutered" checked={formData.isNeutered} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /><label htmlFor="isNeutered" className="ml-2 block text-sm">Kot sterylizowany/kastrowany</label></div><div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj</button><button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center"><LucideSave className="mr-2 h-4 w-4"/> Zapisz</button></div></form></div>);
};

const FoodFormModal = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState({ name: '', type: 'mokra', calories: '' });
    useEffect(() => { if (initialData) setFormData({ name: initialData.name, type: initialData.type, calories: initialData.calories }); }, [initialData]);
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...formData, calories: parseInt(formData.calories) || 0 }); };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up"><form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300"><div className="flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{initialData ? 'Edytuj karmę' : 'Dodaj nową karmę'}</h2><button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX /></button></div><div><label className="block text-sm font-medium">Nazwa karmy</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required /></div><div><label className="block text-sm font-medium">Kaloryczność (kcal / 100g)</label><input type="number" name="calories" value={formData.calories} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required /></div><div><label className="block text-sm font-medium">Typ karmy</label><select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"><option value="mokra">Mokra</option><option value="sucha">Sucha</option></select></div><div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj</button><button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition">{initialData ? 'Zapisz zmiany' : 'Dodaj karmę'}</button></div></form></div></div>);
};

const AddMealForm = ({ foods, onSave, onCancel, isEditMode, initialData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFoodId, setSelectedFoodId] = useState(initialData?.foodId || '');
    const [weight, setWeight] = useState(initialData?.weight || '');

    const filteredFoods = useMemo(() =>
            foods.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [foods, searchTerm]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFoodId || !weight) return;
        const food = foods.find(f => f.id === selectedFoodId);
        if (!food) return;
        const calories = (parseFloat(weight) / 100) * food.calories;
        const mealData = { foodId: food.id, foodName: food.name, foodType: food.type, weight: parseFloat(weight), calories: calories };

        onSave(mealData);

        if (!isEditMode) {
            setSelectedFoodId('');
            setWeight('');
            setSearchTerm('');
        }
    };

    if (isEditMode) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Edytuj posiłek</h2>
                        <div>
                            <label className="block text-sm font-medium">Karma</label>
                            <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required>
                                {foods.map(food => (<option key={food.id} value={food.id}>{food.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Ilość (g)</label>
                            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Anuluj</button>
                            <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Zapisz zmiany</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-gray-700 dark:text-gray-300">
                <label className="block text-sm font-medium">Wyszukaj karmę</label>
                <input type="text" placeholder="Zacznij pisać, aby filtrować..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-gray-700 dark:text-gray-300">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Wybierz karmę</label>
                    <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" required>
                        <option value="" disabled>Wybierz...</option>
                        {filteredFoods.map(food => (<option key={food.id} value={food.id}>{food.name} ({food.calories} kcal/100g)</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Ilość (g)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" placeholder="np. 50" required />
                </div>
            </div>
            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center h-10">
                <LucidePlusCircle className="mr-2 h-5 w-5" /> Dodaj posiłek
            </button>
        </form>
    );
};

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
                <LucideAlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Potwierdzenie</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">{message}</p>
                <div className="flex justify-center space-x-4 w-full">
                    <button onClick={onCancel} className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition">Anuluj</button>
                    <button onClick={onConfirm} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">Usuń</button>
                </div>
            </div>
        </div>
    </div>
);

const FoodManagementModal = ({ foods, onCancel, onEdit, onDelete }) => {
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFoods = useMemo(() =>
            foods.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [foods, searchTerm]
    );

    const handleDeleteRequest = (foodId) => {
        setConfirmingDelete(foodId);
    };

    const confirmDelete = () => {
        onDelete(confirmingDelete);
        setConfirmingDelete(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up flex flex-col" style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Zarządzaj karmami</h2>
                    <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><LucideX /></button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Wyszukaj karmę..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"
                    />
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="space-y-3">
                        {filteredFoods.length > 0 ? filteredFoods.map(food => (
                            <div key={food.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{food.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{food.type}, {food.calories} kcal/100g</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => onEdit(food)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-600 transition"><LucideClipboardEdit className="h-5 w-5" /></button>
                                    <button onClick={() => handleDeleteRequest(food.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition"><LucideTrash2 className="h-5 w-5" /></button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Brak pasujących karm.</p>
                        )}
                    </div>
                </div>
            </div>
            {confirmingDelete && <ConfirmationModal message="Czy na pewno chcesz usunąć tę karmę? Tej operacji nie można cofnąć." onConfirm={confirmDelete} onCancel={() => setConfirmingDelete(null)} />}
        </div>
    );
};

const ExportModal = ({ catId, user, onCancel, showToast }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const catsPath = userCatsCollectionPath(user.uid);

    const handleExport = async () => {
        try {
            let allMeals = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split('T')[0];
                const mealDocRef = doc(db, catsPath, catId, 'meals', dateString);
                const mealDoc = await getDoc(mealDocRef);
                if (mealDoc.exists()) {
                    const dailyMeals = mealDoc.data().meals.map(meal => ({ ...meal, date: dateString }));
                    allMeals.push(...dailyMeals);
                }
            }

            if (allMeals.length === 0) {
                showToast("Brak danych do eksportu w wybranym okresie.", "error");
                return;
            }

            const headers = "Data,Nazwa Karmy,Typ,Waga (g),Kalorie (kcal)\n";
            const csvContent = allMeals.map(m =>
                `${m.date},"${m.foodName}",${m.foodType},${m.weight},${Math.round(m.calories)}`
            ).join("\n");

            const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `eksport_zywienia_${catId}_${startDate}_${endDate}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            showToast("Eksport zakończony pomyślnie.");
            onCancel();

        } catch (error) {
            showToast("Wystąpił błąd podczas eksportu.", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Eksportuj dane żywieniowe</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block text-sm font-medium">Data początkowa</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Data końcowa</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                    <button onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Anuluj</button>
                    <button onClick={handleExport} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Eksportuj</button>
                </div>
            </div>
        </div>
    );
};

export default App;
