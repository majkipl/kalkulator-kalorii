// cypress/e2e/meal_logging.cy.js

import '../support/commands';

describe('Dziennik posiłków - Dodawanie i usuwanie', () => {

    const testFood = {
        name: `Karma do usunięcia ${Date.now()}`,
        calories: 111
    };

    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.contains('Wybierz profil lub stwórz nowy').should('be.visible');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');
    });

    it('powinien pozwolić dodać, a następnie usunąć posiłek', () => {
        // --- Krok 0: Przygotowanie ---
        cy.addFoodViaUI(testFood);

        // --- Krok 1: Dodawanie posiłku ---
        cy.get('form.bg-gray-50').find('.md\\:col-span-2').click();
        cy.contains(testFood.name).click();
        cy.get('input[name="weight"]').type('50');
        cy.get('form.bg-gray-50').contains('button', 'Dodaj posiłek').click();

        // Asercja 1: Sprawdź, czy posiłek pojawił się na liście.
        cy.get('.mt-6.space-y-3')
            .contains(testFood.name)
            .should('be.visible');

        // --- Krok 2: Usuwanie posiłku ---
        // 👇 ZMIANA TUTAJ: Upraszczamy i wzmacniamy selektor
        // Znajdź element z nazwą karmy, przejdź do jego rodzica (div z <p>),
        // potem do rodzica tego rodzica (główny div posiłku) i w nim znajdź przycisk.
        cy.contains(testFood.name)
            .parent() // przejdź do <div>, w którym jest <p> z nazwą i <p> z wagą
            .parent() // przejdź do głównego kontenera <div key={meal.id} ...>
            .find('button[aria-label="Usuń posiłek"]') // w jego obrębie znajdź przycisk usuwania
            .click();

        // Asercja 2: Sprawdź, czy wpis zniknął.
        cy.get('.mt-6.space-y-3')
            .should('not.contain', testFood.name); // 'not.contain' jest bardziej odpowiednie niż 'not.contain.text'
        // Koniec zmiany 👆
    });
});