// /src/setupTests.js

import '@testing-library/jest-dom';

// Mockowanie Firebase, aby uniknąć prawdziwych zapytań w testach jednostkowych
jest.mock('./firebase/config', () => ({
    auth: {
        // Tutaj można dodać mocki funkcji auth, jeśli są potrzebne globalnie
    },
    db: {
        // Mock bazy danych Firestore
    },
}));