// cypress/e2e/cat_profile_validation.cy.js

import '../support/commands';

describe('Walidacja formularza profilu kota', () => {

    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.visit('/select-cat');
        cy.contains('Stwórz Nowy Profil Kota').click();
    });

    it('powinien wyświetlić błędy, gdy wymagane pola (imię, waga) są puste', () => {
        // Klikamy "Zapisz" na całkowicie pustym formularzu (poza domyślnymi wartościami)
        cy.get('[data-cy="profile-save-button"]').click({ force: true });

        // Sprawdzamy, czy pojawiły się oba komunikaty o błędach
        cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
        cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
    });

    context('Testy pola "Imię"', () => {
        it('powinien wyświetlić błąd, gdy tylko imię jest za krótkie', () => {
            // Arrange: Wypełnij poprawnie inne wymagane pola
            cy.get('input[name="currentWeight"]').type('4');
            cy.get('input[name="years"]').type('2');

            // Act: Wprowadź nieprawidłowe imię
            cy.get('input[name="name"]').type('A');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });

            // Assert: Sprawdź, czy pojawił się tylko błąd dotyczący imienia
            cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
            cy.contains('Waga musi być liczbą dodatnią.').should('not.exist');
        });
    });

    context('Testy pola "Aktualna waga"', () => {
        it('powinien wyświetlić błąd, gdy tylko waga jest ujemna', () => {
            // Arrange: Wypełnij poprawnie inne wymagane pola
            cy.get('input[name="name"]').type('Testowy Kot');
            cy.get('input[name="years"]').type('2');

            // Act: Wprowadź nieprawidłową wagę
            cy.get('input[name="currentWeight"]').type('-5');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });

            // Assert: Sprawdź, czy pojawił się tylko błąd dotyczący wagi
            cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
            cy.contains('Imię musi mieć co najmniej 2 znaki.').should('not.exist');
        });
    });

    context('Testy pola "Wiek"', () => {
        it('powinien wyświetlić błąd, gdy lata to 0, a miesiące są puste', () => {
            // Arrange: Wypełnij poprawnie inne wymagane pola
            cy.get('input[name="name"]').type('Kociak');
            cy.get('input[name="currentWeight"]').type('1.5');

            // Act: Wprowadź nieprawidłowy wiek
            cy.get('input[name="years"]').clear().type('0');
            cy.get('input[name="months"]').should('be.visible').clear();

            cy.get('[data-cy="profile-save-button"]').click({ force: true });

            // Assert: Sprawdź, czy pojawił się właściwy błąd
            cy.contains('Dla kociaka poniżej roku podaj liczbę miesięcy.').should('be.visible');
        });
    });

    afterEach(() => {
        // Po każdym teście upewniamy się, że nie nastąpiło przekierowanie
        cy.url().should('not.include', '/dashboard');
    });

});