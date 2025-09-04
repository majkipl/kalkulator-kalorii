// cypress/e2e/food_management.cy.js

import '../support/commands';

describe('Zarządzanie karmami', () => {
    const newFoodName = `Karma Testowa ${Date.now()}`;

    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');
    });

    it('powinien pozwolić na dodanie nowej karmy', () => {
        // Otwieramy sekcję narzędzi
        cy.get('h2').contains('Narzędzia').click();

        // Otwieramy modal dodawania karmy
        cy.contains('button', 'Dodaj nową karmę').click();

        // Wypełniamy formularz w modalu
        cy.get('input[name="name"]').type(newFoodName);
        cy.get('input[name="calories"]').type('150');

        // Klikamy przycisk wewnątrz formularza modala
        cy.get('form').contains('button', 'Dodaj karmę').click();

        // Asercja: Sprawdzamy, czy pojawił się toast o sukcesie.
        cy.contains('Nowa karma została dodana.').should('be.visible');

        // Weryfikacja dodatkowa: sprawdzamy, czy nowa karma jest na liście zarządzania
        cy.contains('button', 'Zarządzaj karmami').click();

        // 👇 ZMIANA TUTAJ: Dodajemy .scrollIntoView()
        // Najpierw szukamy elementu, potem przewijamy do niego i na końcu sprawdzamy, czy jest widoczny.
        cy.contains(newFoodName).scrollIntoView().should('be.visible');
        // Koniec zmiany 👆
    });
});