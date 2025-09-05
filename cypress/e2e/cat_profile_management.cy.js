// /cypress/e2e/cat_profile_management.cy.js

import '../support/commands';

describe('Zarządzanie profilem kota', () => {
    const user = {
        email: 'oxbagx@gmail.com', // Użyj prawdziwych danych
        password: 'asdf1234',
    };

    beforeEach(() => {
        cy.login(user.email, user.password);
    });

    it('powinien pozwolić na stworzenie i usunięcie profilu kota', () => {
        const newCatName = `Testowy Kot ${Date.now()}`;

        // --- Tworzenie profilu ---
        cy.contains('Wybierz profil lub stwórz nowy').should('be.visible');
        cy.contains('Stwórz Nowy Profil Kota').click();

        cy.get('input[name="name"]').type(newCatName);
        cy.get('input[name="currentWeight"]').type('4');
        cy.get('input[name="years"]').type('2');
        // Używamy data-cy, aby upewnić się, że klikamy właściwy przycisk zapisu
        cy.get('[data-cy="profile-save-button"]').click();

        // --- Asercja po stworzeniu ---
        cy.contains('button', newCatName, {timeout: 10000}).should('be.visible');

        // --- Przejście do dashboardu ---
        cy.contains('button', newCatName).click();
        cy.url().should('include', '/dashboard');

        // Rozwiń sekcję profilu, aby przycisk edycji stał się widoczny
        cy.contains('h2', 'Profil kota').click();

        // Kliknij nowy, poprawny przycisk edycji, aby otworzyć formularz
        cy.get('[data-cy="profile-edit-button"]').click();

        cy.contains('button', 'Usuń Profil Kota').click();

        cy.get('input[placeholder="Twoje hasło"]').type(user.password);
        cy.contains('button', 'Potwierdź usunięcie').click();

        // --- Asercja po usunięciu ---
        cy.url().should('include', '/select-cat');
        cy.contains('Profil kota został trwale usunięty').should('be.visible');
        cy.contains(newCatName).should('not.exist');
    });
});