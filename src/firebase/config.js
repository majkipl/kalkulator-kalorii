import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Konfiguracja Twojej aplikacji Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWLLc_kTrKkVIYymPRHhWehoa-P7mw4wY",
    authDomain: "cat-calculator-dd26f.firebaseapp.com",
    projectId: "cat-calculator-dd26f",
    storageBucket: "cat-calculator-dd26f.firebasestorage.app",
    messagingSenderId: "869938257249",
    appId: "1:869938257249:web:3c0def8fb96f034e277920",
    measurementId: "G-8PJVDQNXSZ"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Eksportowanie instancji usług do użycia w innych częściach aplikacji
export const auth = getAuth(app);
export const db = getFirestore(app);