// /src/firebase/paths.js

// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cat-nutrition-default';

/**
 * Zwraca ścieżkę do kolekcji kotów danego użytkownika.
 * @param {string} userId - ID użytkownika.
 * @returns {string} Ścieżka do kolekcji.
 */
export const userCatsCollectionPath = (userId) => `artifacts/${appId}/users/${userId}/cats`;

/**
 * Zwraca ścieżkę do dokumentu z preferencjami użytkownika.
 * @param {string} userId - ID użytkownika.
 * @returns {string} Ścieżka do dokumentu.
 */
export const userPrefsDocPath = (userId) => `artifacts/${appId}/users/${userId}/preferences/main`;

/**
 * Zwraca ścieżkę do publicznej kolekcji z karmami.
 * @returns {string} Ścieżka do kolekcji.
 */
export const foodsCollectionPath = `artifacts/${appId}/public/data/foods`;