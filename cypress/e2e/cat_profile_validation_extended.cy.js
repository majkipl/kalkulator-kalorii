// cypress/e2e/cat_profile_validation_extended.cy.js

import '../support/commands';

describe('Rozszerzona walidacja formularza profilu kota', () => {

    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.visit('/select-cat');
        cy.contains('Stwórz Nowy Profil Kota').click();
    });

    // --- Twoje istniejące, dobre testy ---
    it('powinien wyświetlić błędy, gdy wymagane pola (imię, waga) są puste', () => {
        cy.get('[data-cy="profile-save-button"]').click({ force: true });
        cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
        cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
    });

    it('powinien wyświetlić błąd, gdy tylko imię jest za krótkie', () => {
        cy.get('input[name="currentWeight"]').type('4');
        cy.get('input[name="years"]').type('2');
        cy.get('input[name="name"]').type('A');
        cy.get('[data-cy="profile-save-button"]').click({ force: true });
        cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
        cy.contains('Waga musi być liczbą dodatnią.').should('not.exist');
    });

    // --- Nowe testy dla wartości maksymalnych ---
    context('Walidacja wartości maksymalnych', () => {
        beforeEach(() => {
            // Wypełniamy pola, które nie są przedmiotem testu
            cy.get('input[name="currentWeight"]').type('5');
            cy.get('input[name="years"]').type('3');
        });

        it('powinien wyświetlić błąd, gdy imię jest za długie (> 30 znaków)', () => {
            const longName = 'a'.repeat(31);
            cy.get('input[name="name"]').type(longName);
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Imię nie może być dłuższe niż 30 znaków.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy waga bieżąca jest za duża (> 20 kg)', () => {
            cy.get('input[name="name"]').type('Gruby Kot');
            cy.get('input[name="currentWeight"]').clear().type('21');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga nie może przekraczać 20 kg.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy waga docelowa jest za duża (> 20 kg)', () => {
            cy.get('input[name="name"]').type('Kot Maratończyk');
            cy.get('input[name="targetWeight"]').type('22');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga nie może przekraczać 20 kg.').should('be.visible');
        });
    });

    context('Walidacja wagi docelowej', () => {
        beforeEach(() => {
            cy.get('input[name="name"]').type('Kicia');
            cy.get('input[name="currentWeight"]').type('4');
            cy.get('input[name="years"]').type('2');
        });

        it('powinien pozwolić na zapisanie pustej wagi docelowej', () => {
            cy.get('input[name="targetWeight"]').should('be.empty');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });

            // Sprawdzamy, czy formularz został pomyślnie przesłany,
            // co widać po zmianie URL na stronę wyboru kota.
            cy.url().should('include', '/select-cat');
            cy.contains('Profil kota został pomyślnie utworzony!').should('be.visible');
        });

        it('powinien wyświetlić błąd dla ujemnej wagi docelowej', () => {
            cy.get('input[name="targetWeight"]').type('-3');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
        });
    });

    context('Walidacja wartości granicznych wieku', () => {
        beforeEach(() => {
            cy.get('input[name="name"]').type('Matuzalem');
            cy.get('input[name="currentWeight"]').type('5');
        });

        it('powinien wyświetlić błąd, gdy lata przekraczają 30', () => {
            cy.get('input[name="years"]').type('31');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Wiek nie może przekraczać 30 lat.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy miesiące przekraczają 11', () => {
            cy.get('input[name="years"]').clear().type('0');
            cy.get('input[name="months"]').should('be.visible').type('12');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Miesiące muszą być w zakresie od 0 do 11.').should('be.visible');
        });
    });

    afterEach(() => {
    });
});