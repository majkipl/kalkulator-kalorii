// cypress/e2e/add_meal.cy.js

import '../support/commands';

describe('Dodawanie posiłku do dziennika', () => {

    // Tworzymy obiekt z danymi testowymi dla karmy
    const testFood = {
        name: `Karma Do Posiłku ${Date.now()}`, // Unikalna nazwa, aby testy były niezależne
        calories: 150
    };

    beforeEach(() => {
        // Logowanie i nawigacja do dashboardu kota
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.contains('Wybierz profil lub stwórz nowy').should('be.visible');
        cy.get('.space-y-3 > button').first().click();
        cy.url().should('include', '/dashboard');
    });

    it('powinien pozwolić na dodanie posiłku, używając nowo stworzonej karmy', () => {
        // Krok 0: Przygotuj stan aplikacji - stwórz karmę, której będziemy używać w teście.
        cy.addFoodViaUI(testFood);

        // --- Właściwy test dodawania posiłku ---

        // Krok 1: Znajdź formularz dodawania posiłku i kliknij w pole select, aby otworzyć listę
        // Szukamy po klasach, które są unikalne dla tego formularza
        cy.get('form.bg-gray-50').find('.md\\:col-span-2').click();

        // Krok 2: Znajdź na liście opcję z nazwą naszej karmy i kliknij ją
        cy.contains(testFood.name).click();

        // Krok 3: Wpisz wagę posiłku
        cy.get('input[name="weight"]').type('75');

        // Krok 4: Kliknij przycisk "Dodaj posiłek", zawężając szukanie do formularza
        cy.get('form.bg-gray-50').contains('button', 'Dodaj posiłek').click();

        // Krok 5: Weryfikacja - Sprawdź, czy nowy posiłek pojawił się na liście dnia
        // Sprawdzamy, czy kontener z posiłkami zawiera zarówno nazwę karmy, jak i jej wagę.
        cy.get('.mt-6.space-y-3')
            .should('contain.text', testFood.name)
            .and('contain.text', '75g');
    });
});