// /cypress/e2e/food_editing.cy.js

import '../support/commands';

describe('Zarządzanie karmami - Edycja', () => {
    // Dane testowe, które będą unikalne dla każdego przebiegu testu
    const initialFood = {
        name: `Karma Do Edycji ${Date.now()}`,
        calories: 250,
        type: 'Mokra'
    };

    const updatedFood = {
        name: `Zaktualizowana Karma ${Date.now()}`,
        calories: 300,
        type: 'Sucha'
    };

    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');
        cy.addFoodViaUI(initialFood);
    });

    const openManageFoodsModal = () => {
        cy.get('h2').contains('Narzędzia').click({ force: true });
        cy.contains('button', 'Zarządzaj karmami').click();
        cy.contains('h2', 'Zarządzaj karmami').should('be.visible');
    };

    it('powinien pozwolić na edycję nazwy, kalorii i typu istniejącej karmy', () => {
        openManageFoodsModal();

        // 1. Znajdź karmę na liście i kliknij przycisk edycji
        cy.contains(initialFood.name)
            .parents('.flex.items-center.justify-between')
            .find('button[title="Edytuj"]')
            .click();

        // 2. Modal edycji powinien się pojawić, a my zawężamy dalsze działania do jego wnętrza
        cy.contains('h2', 'Edytuj karmę')
            .closest('.bg-white.dark\\:bg-gray-800') // Znajdź główny kontener modala
            .find('form') // Znajdź formularz wewnątrz modala
            .within(() => { // Wszystkie kolejne komendy wykonają się wewnątrz tego formularza
                // 3. Wyczyść pola i wprowadź nowe dane
                cy.get('input[name="name"]').clear().type(updatedFood.name);
                cy.get('input[name="calories"]').clear().type(updatedFood.calories);

                // 👇 KLUCZOWA POPRAWKA
                // Znajdujemy input react-select wewnątrz formularza, focusujemy go i wpisujemy tekst.
                // .first() gwarantuje, że wybierzemy tylko jeden, widoczny element.
                cy.get('input[id^="react-select-"][id*="-input"]').first().focus().type(`${updatedFood.type}{enter}`);

                // 4. Zapisz zmiany
                cy.contains('button', 'Zapisz zmiany').click();
            });

        cy.contains('Karma została zaktualizowana.').should('be.visible');

        // 5. Otwórz ponownie modal zarządzania i zweryfikuj, czy dane na liście są poprawne
        openManageFoodsModal();
        cy.contains(updatedFood.name).scrollIntoView().should('be.visible');
        cy.contains(updatedFood.name)
            .parents('.flex.items-center.justify-between')
            .within(() => {
                cy.contains(`sucha, ${updatedFood.calories} kcal/100g`).should('be.visible');
            });
    });
});