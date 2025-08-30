// /src/components/dashboard/HealthJournal.js

import React, {useState, useEffect} from 'react';
import {collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath, userVetsCollectionPath} from '../../firebase/paths';
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';

// Importy komponentów podrzędnych i modali
import DailyHealthLog from './DailyHealthLog';
import VetVisitFormModal from '../modals/VetVisitFormModal';
import ParasiteControlFormModal from '../modals/ParasiteControlFormModal';

// Importy stylów i ikon
import {typographyStyles} from '../../utils/formStyles';
import {LucidePlusCircle, LucideTrash2, LucidePencil} from 'lucide-react';
import FormError from '../../shared/FormError';


const HealthJournal = ({catId, currentDate}) => {
    const {user} = useAuth();
    const {showToast} = useAppContext();
    const [activeTab, setActiveTab] = useState('symptoms');
    const [isEditingDailyLog, setIsEditingDailyLog] = useState(false);

    // Stany dla danych z podkolekcji
    const [vetVisits, setVetVisits] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [deworming, setDeworming] = useState([]);
    const [vets, setVets] = useState([]); // Stan na listę weterynarzy

    // Stan dla danych z bieżącego dnia (dla zakładki "Codzienne Objawy")
    const [dailyData, setDailyData] = useState({note: '', waterIntake: '', medications: '', symptomTags: []});

    // Stan do zarządzania otwieraniem modali
    const [modalState, setModalState] = useState({
        vetVisit: {isOpen: false, data: null},
        vaccination: {isOpen: false, data: null},
        deworming: {isOpen: false, data: null}
    });

    const catsPath = userCatsCollectionPath(user.uid);
    const vetsPath = userVetsCollectionPath(user.uid);

    // Efekty do pobierania danych
    useEffect(() => {
        const path = (subcollection) => collection(db, catsPath, catId, subcollection);
        const q = (subcollection) => query(path(subcollection), orderBy('date', 'desc'));

        const unsubVisits = onSnapshot(q('vetVisits'), snapshot => setVetVisits(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubVaccinations = onSnapshot(q('vaccinations'), snapshot => setVaccinations(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubDeworming = onSnapshot(q('deworming'), snapshot => setDeworming(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));

        // Pobieranie listy weterynarzy
        const qVets = query(collection(db, vetsPath));
        const unsubVets = onSnapshot(qVets, snapshot => setVets(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));

        return () => {
            unsubVisits();
            unsubVaccinations();
            unsubDeworming();
            unsubVets();
        };
    }, [catId, catsPath, vetsPath]);

    useEffect(() => {
        if (!catId || !currentDate) return;
        const mealDocRef = doc(db, catsPath, catId, 'meals', currentDate);
        const unsubMeals = onSnapshot(mealDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setDailyData({
                    note: data.note || '',
                    waterIntake: data.waterIntake || '',
                    medications: data.medications || '',
                    symptomTags: data.symptomTags || []
                });
            } else {
                setDailyData({note: '', waterIntake: '', medications: '', symptomTags: []});
            }
        });
        return () => unsubMeals();
    }, [catId, currentDate, catsPath]);

    // Handlery do zapisu i usuwania
    const handleSave = async (subcollection, data, id) => {
        try {
            if (id) {
                await updateDoc(doc(db, catsPath, catId, subcollection, id), data);
                showToast("Wpis został zaktualizowany.");
            } else {
                await addDoc(collection(db, catsPath, catId, subcollection), data);
                showToast("Nowy wpis został dodany.");
            }
            return true;
        } catch (error) {
            console.error("Błąd zapisu:", error);
            showToast("Wystąpił błąd podczas zapisu.", "error");
            return false;
        }
    };

    const handleDelete = async (subcollection, id) => {
        if (window.confirm("Czy na pewno chcesz usunąć ten wpis?")) {
            try {
                await deleteDoc(doc(db, catsPath, catId, subcollection, id));
                showToast("Wpis został usunięty.");
            } catch (error) {
                showToast("Błąd podczas usuwania.", "error");
            }
        }
    };

    const TabButton = ({tabName, label}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className={typographyStyles.h2}>Dziennik Zdrowia</h2>
                    <div className="flex flex-wrap gap-2">
                        <TabButton tabName="symptoms" label="Codzienne Objawy"/>
                        <TabButton tabName="visits" label="Wizyty"/>
                        <TabButton tabName="vaccinations" label="Szczepienia"/>
                        <TabButton tabName="deworming" label="Odrobaczanie"/>
                    </div>
                </div>

                {activeTab === 'symptoms' && (
                    <DailyHealthLog
                        catId={catId}
                        currentDate={currentDate}
                        isEditing={isEditingDailyLog}
                        setIsEditing={setIsEditingDailyLog}
                        initialData={dailyData}
                    />
                )}

                {activeTab === 'visits' && (
                    <div>
                        <button className="flex items-center text-indigo-500 mb-4"
                                onClick={() => setModalState(s => ({...s, vetVisit: {isOpen: true, data: null}}))}>
                            <LucidePlusCircle className="mr-2"/> Dodaj wizytę
                        </button>
                        {vetVisits.length > 0 ? vetVisits.map(visit => (
                            <div key={visit.id} className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p>
                                            <strong>{new Date(visit.date.seconds * 1000).toLocaleDateString()} - {visit.reason}</strong>
                                        </p>
                                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{visit.vetName}</p>
                                        {visit.diagnosis && <p className="text-sm mt-1">Diagnoza: {visit.diagnosis}</p>}
                                        {visit.recommendations &&
                                            <p className="text-sm mt-1">Zalecenia: {visit.recommendations}</p>}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button onClick={() => setModalState(s => ({
                                            ...s,
                                            vetVisit: {isOpen: true, data: visit}
                                        }))} className="p-1"><LucidePencil size={16}/></button>
                                        <button onClick={() => handleDelete('vetVisits', visit.id)}
                                                className="p-1 text-red-500"><LucideTrash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">Brak zapisanych wizyt.</p>}
                    </div>
                )}
                {activeTab === 'vaccinations' && (
                    <div>
                        <button className="flex items-center text-indigo-500 mb-4"
                                onClick={() => setModalState(s => ({...s, vaccination: {isOpen: true, data: null}}))}>
                            <LucidePlusCircle className="mr-2"/> Dodaj szczepienie
                        </button>
                        {vaccinations.length > 0 ? vaccinations.map(vac => (
                            <div key={vac.id} className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p>
                                            <strong>{new Date(vac.date.seconds * 1000).toLocaleDateString()} - {vac.productName}</strong>
                                        </p>
                                        {vac.nextDueDate &&
                                            <p className="text-sm text-amber-600 dark:text-amber-400">Następna
                                                dawka: {new Date(vac.nextDueDate.seconds * 1000).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button onClick={() => setModalState(s => ({
                                            ...s,
                                            vaccination: {isOpen: true, data: vac}
                                        }))} className="p-1"><LucidePencil size={16}/></button>
                                        <button onClick={() => handleDelete('vaccinations', vac.id)}
                                                className="p-1 text-red-500"><LucideTrash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">Brak zapisanych szczepień.</p>}
                    </div>
                )}
                {activeTab === 'deworming' && (
                    <div>
                        <button className="flex items-center text-indigo-500 mb-4"
                                onClick={() => setModalState(s => ({...s, deworming: {isOpen: true, data: null}}))}>
                            <LucidePlusCircle className="mr-2"/> Dodaj odrobaczanie
                        </button>
                        {deworming.length > 0 ? deworming.map(dew => (
                            <div key={dew.id} className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p>
                                            <strong>{new Date(dew.date.seconds * 1000).toLocaleDateString()} - {dew.productName}</strong>
                                        </p>
                                        {dew.nextDueDate &&
                                            <p className="text-sm text-amber-600 dark:text-amber-400">Następna
                                                dawka: {new Date(dew.nextDueDate.seconds * 1000).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button onClick={() => setModalState(s => ({
                                            ...s,
                                            deworming: {isOpen: true, data: dew}
                                        }))} className="p-1"><LucidePencil size={16}/></button>
                                        <button onClick={() => handleDelete('deworming', dew.id)}
                                                className="p-1 text-red-500"><LucideTrash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">Brak zapisanych odrobaczeń.</p>}
                    </div>
                )}
            </div>

            {modalState.vetVisit.isOpen && <VetVisitFormModal
                vets={vets}
                onCancel={() => setModalState(s => ({...s, vetVisit: {isOpen: false, data: null}}))}
                onSave={async (data) => {
                    const success = await handleSave('vetVisits', data, modalState.vetVisit.data?.id);
                    if (success) setModalState(s => ({...s, vetVisit: {isOpen: false, data: null}}));
                }}
                initialData={modalState.vetVisit.data}
            />}
            {modalState.vaccination.isOpen && <ParasiteControlFormModal
                eventType="vaccination"
                onCancel={() => setModalState(s => ({...s, vaccination: {isOpen: false, data: null}}))}
                onSave={async (data) => {
                    const success = await handleSave('vaccinations', data, modalState.vaccination.data?.id);
                    if (success) setModalState(s => ({...s, vaccination: {isOpen: false, data: null}}));
                }}
                initialData={modalState.vaccination.data}
            />}
            {modalState.deworming.isOpen && <ParasiteControlFormModal
                eventType="deworming"
                onCancel={() => setModalState(s => ({...s, deworming: {isOpen: false, data: null}}))}
                onSave={async (data) => {
                    const success = await handleSave('deworming', data, modalState.deworming.data?.id);
                    if (success) setModalState(s => ({...s, deworming: {isOpen: false, data: null}}));
                }}
                initialData={modalState.deworming.data}
            />}
        </>
    );
};

export default HealthJournal;