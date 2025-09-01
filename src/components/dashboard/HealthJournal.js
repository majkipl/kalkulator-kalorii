// /src/components/dashboard/HealthJournal.js

import React, {useState, useEffect} from 'react';
import {collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {userCatsCollectionPath, userVetsCollectionPath} from '../../firebase/paths';
import {useAuth} from '../../context/AuthContext';
import {useAppContext} from '../../context/AppContext';

// Komponenty
import DailyHealthLog from './DailyHealthLog';
import VetVisitFormModal from '../modals/VetVisitFormModal';
import ParasiteControlFormModal from '../modals/ParasiteControlFormModal';

// Style i ikony
import {formStyles, typographyStyles} from '../../utils/formStyles';
import {
    LucidePlusCircle,
    LucideTrash2,
    LucidePencil,
    LucideClipboardEdit,
    LucideNotebookText,
    LucideChevronDown
} from 'lucide-react';
import useCollapsible from '../../hooks/useCollapsible';

const HealthJournal = ({catId, currentDate}) => {
    const {user} = useAuth();
    const {showToast} = useAppContext();
    const [activeTab, setActiveTab] = useState('symptoms');
    const [isEditingDailyLog, setIsEditingDailyLog] = useState(false);

    // Stany dla danych z podkolekcji
    const [vetVisits, setVetVisits] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [deworming, setDeworming] = useState([]);
    const [vets, setVets] = useState([]);

    // Stan dla danych z bieżącego dnia
    const [dailyData, setDailyData] = useState({note: '', waterIntake: '', medications: '', symptomTags: []});

    // Stan do zarządzania otwieraniem modali
    const [modalState, setModalState] = useState({
        vetVisit: {isOpen: false, data: null},
        vaccination: {isOpen: false, data: null},
        deworming: {isOpen: false, data: null}
    });

    const journalCollapsible = useCollapsible(false);

    const catsPath = userCatsCollectionPath(user.uid);
    const vetsPath = userVetsCollectionPath(user.uid);

    // Efekty do pobierania danych
    useEffect(() => {
        const path = (subcollection) => collection(db, catsPath, catId, subcollection);
        const q = (subcollection) => query(path(subcollection), orderBy('date', 'desc'));

        const unsubVisits = onSnapshot(q('vetVisits'), snapshot => setVetVisits(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubVaccinations = onSnapshot(q('vaccinations'), snapshot => setVaccinations(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubDeworming = onSnapshot(q('deworming'), snapshot => setDeworming(snapshot.docs.map(d => ({id: d.id, ...d.data()}))));

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
            onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tabName);
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
                <div {...journalCollapsible.triggerProps}>
                    <h2 className={`${typographyStyles.h2} flex items-center`}>
                        <LucideNotebookText className="mr-2 h-6 w-6 text-indigo-500"/>
                        Dziennik Zdrowia
                    </h2>
                    <LucideChevronDown
                        className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 lg:hidden ${journalCollapsible.isOpen ? 'rotate-180' : ''}`}/>
                </div>

                <div {...journalCollapsible.contentProps}>
                    <div className="overflow-hidden pt-4">
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                            <TabButton tabName="symptoms" label="Obserwacje"/>
                            <TabButton tabName="visits" label="Wizyty"/>
                            <TabButton tabName="vaccinations" label="Szczepienia"/>
                            <TabButton tabName="deworming" label="Odrobaczanie"/>
                        </div>

                        {activeTab === 'symptoms' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditingDailyLog(!isEditingDailyLog);
                                    }} className={formStyles.buttonActionLight}>
                                        <LucideClipboardEdit className="h-4 w-4 mr-2"/>
                                        {isEditingDailyLog ? 'Anuluj edycję' : 'Edytuj dzisiejsze obserwacje'}
                                    </button>
                                </div>
                                <DailyHealthLog
                                    catId={catId}
                                    currentDate={currentDate}
                                    isEditing={isEditingDailyLog}
                                    setIsEditing={setIsEditingDailyLog}
                                    initialData={dailyData}
                                />
                            </div>
                        )}

                        {activeTab === 'visits' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setModalState(s => ({...s, vetVisit: {isOpen: true, data: null}}));
                                    }} className={formStyles.buttonActionLight}>
                                        <LucidePlusCircle className="h-4 w-4 mr-2"/> Dodaj wizytę
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {vetVisits.length > 0 ? vetVisits.map(visit => (
                                        <div key={visit.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p>
                                                        <strong>{new Date(visit.date.seconds * 1000).toLocaleDateString()} - {visit.reason}</strong>
                                                    </p>
                                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{visit.vetName}</p>
                                                    {visit.diagnosis &&
                                                        <p className="text-sm mt-1">Diagnoza: {visit.diagnosis}</p>}
                                                    {visit.recommendations &&
                                                        <p className="text-sm mt-1">Zalecenia: {visit.recommendations}</p>}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        setModalState(s => ({
                                                            ...s,
                                                            vetVisit: {isOpen: true, data: visit}
                                                        }))
                                                    }} className="p-1"><LucidePencil size={16}/></button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete('vetVisits', visit.id)
                                                    }} className="p-1 text-red-500"><LucideTrash2 size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 text-center py-4">Brak zapisanych
                                        wizyt.</p>}
                                </div>
                            </div>
                        )}
                        {activeTab === 'vaccinations' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setModalState(s => ({...s, vaccination: {isOpen: true, data: null}}));
                                    }} className={formStyles.buttonActionLight}>
                                        <LucidePlusCircle className="h-4 w-4 mr-2"/> Dodaj szczepienie
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {vaccinations.length > 0 ? vaccinations.map(vac => (
                                        <div key={vac.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        setModalState(s => ({
                                                            ...s,
                                                            vaccination: {isOpen: true, data: vac}
                                                        }))
                                                    }} className="p-1"><LucidePencil size={16}/></button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete('vaccinations', vac.id)
                                                    }} className="p-1 text-red-500"><LucideTrash2 size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 text-center py-4">Brak zapisanych
                                        szczepień.</p>}
                                </div>
                            </div>
                        )}
                        {activeTab === 'deworming' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setModalState(s => ({...s, deworming: {isOpen: true, data: null}}));
                                    }} className={formStyles.buttonActionLight}>
                                        <LucidePlusCircle className="h-4 w-4 mr-2"/> Dodaj odrobaczanie
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {deworming.length > 0 ? deworming.map(dew => (
                                        <div key={dew.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        setModalState(s => ({
                                                            ...s,
                                                            deworming: {isOpen: true, data: dew}
                                                        }))
                                                    }} className="p-1"><LucidePencil size={16}/></button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete('deworming', dew.id)
                                                    }} className="p-1 text-red-500"><LucideTrash2 size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 text-center py-4">Brak zapisanych
                                        odrobaczeń.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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