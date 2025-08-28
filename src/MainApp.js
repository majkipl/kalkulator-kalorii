// import React, {useState, useEffect} from 'react';
// import {collection, onSnapshot, query, addDoc} from 'firebase/firestore';
// import {db} from './firebase/config';
// import {userCatsCollectionPath} from './firebase/paths';
//
// // Pobieramy globalne funkcje i stany z naszego kontekstu
// import {useAppContext} from './context/AppContext';
//
// // Importujemy komponenty, którymi zarządza MainApp
// import Dashboard from './components/dashboard/Dashboard';
// import CatSelection from './shared/CatSelection';
// import Spinner from './shared/Spinner';
//
// const MainApp = ({user}) => {
//     // Pobieramy potrzebne elementy z kontekstu aplikacji
//     const {showToast, theme, setTheme} = useAppContext();
//
//     // Stany lokalne dla zalogowanego użytkownika
//     const [cats, setCats] = useState([]);
//     const [selectedCatId, setSelectedCatId] = useState(null);
//     const [loadingCats, setLoadingCats] = useState(true);
//     const [initialCheckDone, setInitialCheckDone] = useState(false);
//
//     // Efekt do pobierania profili kotów należących do użytkownika
//     useEffect(() => {
//         if (!user?.uid) return;
//
//         setLoadingCats(true);
//         const q = query(collection(db, userCatsCollectionPath(user.uid)));
//
//         const unsubscribe = onSnapshot(q, (snapshot) => {
//             const catsData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
//             setCats(catsData);
//             setLoadingCats(false);
//         }, (error) => {
//             console.error("Błąd pobierania profili kotów:", error);
//             showToast("Nie udało się pobrać profili kotów.", "error");
//             setLoadingCats(false);
//         });
//
//         return () => unsubscribe();
//     }, [user.uid, showToast]);
//
//     // Efekt do automatycznego wyboru profilu, jeśli jest tylko jeden
//     useEffect(() => {
//         if (!loadingCats && !initialCheckDone && cats.length === 1) {
//             setSelectedCatId(cats[0].id);
//             setInitialCheckDone(true);
//         }
//     }, [loadingCats, cats, initialCheckDone]);
//
//     // Funkcja do tworzenia nowego profilu kota
//     const handleCreateCat = async (newCatData) => {
//         try {
//             await addDoc(collection(db, userCatsCollectionPath(user.uid)), {
//                 ...newCatData,
//                 ownerId: user.uid
//             });
//             // setIsCreatingCat(false); // Ten stan jest teraz wewnątrz CatSelection
//             showToast("Profil kota został pomyślnie utworzony!");
//         } catch (error) {
//             showToast("Nie udało się utworzyć profilu.", "error");
//         }
//     };
//
//     // --- Renderowanie warunkowe ---
//
//     if (loadingCats) {
//         return (
//             <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
//                 <Spinner/>
//             </div>
//         );
//     }
//
//     if (!selectedCatId) {
//         return (
//             <CatSelection
//                 cats={cats}
//                 handleCreateCat={handleCreateCat}
//                 setSelectedCatId={setSelectedCatId}
//                 theme={theme}
//             />
//         );
//     }
//
//     return (
//         <Dashboard
//             catId={selectedCatId}
//             onBack={() => setSelectedCatId(null)}
//             user={user}
//             // showToast, theme i setTheme są teraz pobierane w Dashboard z kontekstu,
//             // ale dla spójności przekazujemy je dalej, jeśli komponenty potomne ich oczekują
//             showToast={showToast}
//             theme={theme}
//             setTheme={setTheme}
//         />
//     );
// };
//
// export default MainApp;