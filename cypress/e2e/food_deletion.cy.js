// /cypress/e2e/food_deletion.cy.js

import '../support/commands';

describe('Zarządzanie karmami - Usuwanie', () => {
    // Dane testowe dla karmy, która zostanie usunięta
    const foodToDelete = {
        name: `Karma Do Usunięcia ${Date.now()}`,
        calories: 123,
        type: 'Mokra'
    };

    // Przed każdym testem logujemy się i tworzymy karmę, którą będziemy usuwać.
    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');

        // Stwórz karmę, którą będziemy usuwać w teście
        cy.addFoodViaUI(foodToDelete);
    });

    const openManageFoodsModal = () => {
        cy.get('h2').contains('Narzędzia').click({ force: true });
        cy.contains('button', 'Zarządzaj karmami').click();
        cy.contains('h2', 'Zarządzaj karmami').should('be.visible');
    };

    it('powinien pozwolić na usunięcie karmy i zweryfikować jej brak w aplikacji', () => {
        openManageFoodsModal();

        // 1. Znajdź karmę na liście i kliknij przycisk usuwania
        cy.contains(foodToDelete.name)
            .parents('.flex.items-center.justify-between')
            .find('button[title="Usuń"]')
            .click();

        // 2. Pojawi się modal potwierdzający - kliknij "Usuń"
        cy.get('.fixed.inset-0').contains('button', 'Usuń').click();

        // 3. Sprawdź, czy pojawił się toast o sukcesie
        cy.contains('Karma została usunięta.').should('be.visible');

        // 4. Sprawdź, czy karma zniknęła z listy w modalu zarządzania
        cy.contains(foodToDelete.name).should('not.exist');

        // 5. Zamknij modal zarządzania
        cy.get('h2').contains('Zarządzaj karmami').siblings('button').click();
        cy.contains('h2', 'Zarządzaj karmami').should('not.exist');

        // 6. (Kluczowa weryfikacja!) Sprawdź, czy karma zniknęła z listy wyboru przy dodawaniu posiłku
        cy.get('form.bg-gray-50').find('.md\\:col-span-2').click(); // Otwórz select
        cy.contains(foodToDelete.name).should('not.exist');
    });

    it('powinien zamknąć okno potwierdzenia i nie usuwać karmy po kliknięciu "Anuluj"', () => {
        openManageFoodsModal();

        // 1. Znajdź karmę na liście i kliknij przycisk usuwania
        cy.contains(foodToDelete.name)
            .parents('.flex.items-center.justify-between')
            .find('button[title="Usuń"]')
            .click();

        // 2. W modalu potwierdzającym kliknij "Anuluj"
        cy.get('.fixed.inset-0').contains('button', 'Anuluj').click();

        // 3. Sprawdź, czy modal potwierdzenia zniknął
        cy.get('.fixed.inset-0').contains('Czy na pewno chcesz usunąć tę karmę?').should('not.exist');

        // 4. Sprawdź, czy karma wciąż jest widoczna na liście w modalu zarządzania
        cy.contains(foodToDelete.name).should('be.visible');
    });
});