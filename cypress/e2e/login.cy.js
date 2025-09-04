// /cypress/e2e/login.cy.js

import '../support/commands';

describe('Logowanie', () => {
    // Ten blok wykona się przed każdym testem w tym pliku
    beforeEach(() => {
        // Odwiedzamy stronę logowania przed każdą próbą
        cy.visit('/login');
    });

    it('powinien poprawnie zalogować istniejącego użytkownika', () => {
        // Wpisz tutaj e-mail i hasło istniejącego użytkownika testowego
        const email = 'oxbagx@gmail.com'; // Zastąp prawdziwym emailem testowym
        const password = 'asdf1234';

        // Wypełniamy formularz
        cy.get('input[placeholder="Adres e-mail"]').type(email);
        cy.get('input[placeholder="Hasło"]').type(password);

        // Klikamy przycisk logowania
        cy.get('button[type="submit"]').contains('Zaloguj się').click();

        // Asercja: Sprawdzamy, czy nastąpiło przekierowanie
        // i czy na stronie jest element świadczący o sukcesie
        cy.url().should('include', '/select-cat');
        cy.contains('Wybierz profil lub stwórz nowy').should('be.visible');
    });

    it('powinien wyświetlić błąd dla nieprawidłowych danych logowania', () => {
        // Używamy celowo złych danych
        cy.get('input[placeholder="Adres e-mail"]').type('zly@email.com');
        cy.get('input[placeholder="Hasło"]').type('zlehaslo');

        cy.get('button[type="submit"]').contains('Zaloguj się').click();

        // Asercja: Sprawdzamy, czy na stronie pojawił się komunikat o błędzie
        cy.contains('Nieprawidłowy e-mail lub hasło.').should('be.visible');

        // Asercja: Sprawdzamy, czy NIE zostaliśmy przekierowani
        cy.url().should('not.include', '/select-cat');
    });
});