// cypress/e2e/food_creation.cy.js

import '../support/commands';

describe('Tworzenie nowej karmy', () => {

    // Generujemy unikalną nazwę dla karmy przy każdym uruchomieniu testu,
    // aby uniknąć konfliktów z danymi z poprzednich testów.
    const newFoodName = `Moja Nowa Karma Testowa ${Date.now()}`;

    beforeEach(() => {
        // Logowanie i nawigacja do dashboardu przed każdym testem
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.contains('Wybierz profil lub stwórz nowy').should('be.visible');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');
    });

    it('powinien pozwolić użytkownikowi na dodanie nowej karmy i zweryfikowanie jej na liście', () => {
        // Krok 1: Otwórz sekcję "Narzędzia"
        cy.get('h2').contains('Narzędzia').click();

        // Krok 2: Kliknij przycisk otwierający modal dodawania karmy
        cy.contains('button', 'Dodaj nową karmę').click();

        // Krok 3: Wypełnij formularz w modalu
        cy.get('input[name="name"]').type(newFoodName);
        cy.get('input[name="calories"]').type('350');

        // Krok 4: Zatwierdź formularz
        cy.get('form').contains('button', 'Dodaj karmę').click();

        // Krok 5: Weryfikacja #1 - Sprawdź, czy pojawił się komunikat o sukcesie (Toast)
        cy.contains('Nowa karma została dodana.').should('be.visible');

        // Krok 6: Weryfikacja #2 - Sprawdź, czy nowa karma faktycznie jest na liście
        cy.contains('button', 'Zarządzaj karmami').click();

        // Przewiń listę do nowo dodanego elementu i sprawdź, czy jest widoczny
        cy.contains(newFoodName).scrollIntoView().should('be.visible');
    });
});