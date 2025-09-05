// /cypress/e2e/food_creation.cy.js

import '../support/commands';

describe('Zarządzanie karmami - Tworzenie i Walidacja', () => {
    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');
    });

    context('Scenariusz pomyślny (Happy Path)', () => {
        const newFoodName = `Moja Nowa Karma ${Date.now()}`;

        it('powinien pozwolić na dodanie nowej karmy (mokrej) i zweryfikowanie jej na liście', () => {
            cy.get('h2').contains('Narzędzia').click({ force: true });
            cy.contains('button', 'Dodaj nową karmę').click();

            cy.contains('h2', 'Dodaj nową karmę').closest('.bg-white.dark\\:bg-gray-800').find('form').within(() => {
                cy.get('input[name="name"]').type(newFoodName);
                cy.get('input[name="calories"]').type('350');
                cy.get('input[id^="react-select-"][id*="-input"]').type('Mokra{enter}');
                cy.contains('button', 'Dodaj karmę').click();
            });

            cy.contains('Nowa karma została dodana.').should('be.visible');
            cy.contains('button', 'Zarządzaj karmami').click();

            // 👇 POPRAWKA FINALNA: Najpierw znajdujemy element, potem przewijamy do niego widok,
            // a dopiero na końcu sprawdzamy, czy jest widoczny.
            cy.contains(newFoodName).scrollIntoView().should('be.visible');

            cy.contains(newFoodName).parents('.flex.items-center.justify-between').within(() => {
                cy.contains('mokra, 350 kcal/100g').should('be.visible');
            });
        });
    });

    context('Walidacja formularza i przypadki brzegowe', () => {
        beforeEach(() => {
            cy.get('h2').contains('Narzędzia').click({ force: true });
            cy.contains('button', 'Dodaj nową karmę').click();
        });

        it('powinien wyświetlić błędy, gdy nazwa i kaloryczność są puste', () => {
            cy.get('form').contains('button', 'Dodaj karmę').click();
            cy.contains('Nazwa musi mieć co najmniej 3 znaki.').should('be.visible');
            cy.contains('Kaloryczność musi być liczbą dodatnią.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy nazwa jest za krótka', () => {
            cy.get('input[name="name"]').type('AB');
            cy.get('input[name="calories"]').type('150');
            cy.get('form').contains('button', 'Dodaj karmę').click();
            cy.contains('Nazwa musi mieć co najmniej 3 znaki.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy nazwa jest za długa', () => {
            const longName = 'a'.repeat(51);
            cy.get('input[name="name"]').type(longName);
            cy.get('input[name="calories"]').type('150');
            cy.get('form').contains('button', 'Dodaj karmę').click();
            cy.contains('Nazwa nie może być dłuższa niż 50 znaków.').should('be.visible');
        });

        it('powinien wyświetlić błąd dla kaloryczności równej zero', () => {
            cy.get('input[name="name"]').type('Karma Zero');
            cy.get('input[name="calories"]').type('0');
            cy.get('form').contains('button', 'Dodaj karmę').click();
            cy.contains('Kaloryczność musi być liczbą dodatnią.').should('be.visible');
        });

        it('powinien wyświetlić błąd dla kaloryczności ujemnej', () => {
            cy.get('input[name="name"]').type('Karma Ujemna');
            cy.get('input[name="calories"]').type('-100');
            cy.get('form').contains('button', 'Dodaj karmę').click();
            cy.contains('Kaloryczność musi być liczbą dodatnią.').should('be.visible');
        });

        it('powinien wyświetlić błąd dla zbyt wysokiej kaloryczności', () => {
            cy.get('input[name="name"]').type('Super Kaloryczna');
            cy.get('input[name="calories"]').type('1001');
            cy.get('form').contains('button', 'Dodaj karmę').click();
            cy.contains('Kaloryczność nie może być wyższa niż 1000 kcal/100g.').should('be.visible');
        });

        it('powinien uniemożliwić dodanie karmy o tej samej nazwie', () => {
            const duplicateName = `Karma Duplikat ${Date.now()}`;
            cy.get('form').contains('button', 'Anuluj').click();

            cy.addFoodViaUI({ name: duplicateName, calories: 200 });

            cy.get('h2').contains('Narzędzia').click({ force: true });
            cy.contains('button', 'Dodaj nową karmę').click();

            cy.get('input[name="name"]').type(duplicateName);
            cy.get('input[name="calories"]').type('250');
            cy.get('form').contains('button', 'Dodaj karmę').click();

            cy.contains('Karma o tej nazwie już istnieje.').should('be.visible');
        });

        it('powinien zamknąć modal i nie dodawać karmy po kliknięciu "Anuluj"', () => {
            const cancelledFoodName = 'Anulowana Karma';
            cy.get('input[name="name"]').type(cancelledFoodName);
            cy.get('form').contains('button', 'Anuluj').click();

            cy.contains('h2', 'Dodaj nową karmę').should('not.exist');
            cy.contains('button', 'Zarządzaj karmami').click();
            cy.contains(cancelledFoodName).should('not.exist');
        });
    });
});