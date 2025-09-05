// /cypress/e2e/cat_profile_creation.cy.js

import '../support/commands';

describe('Kompleksowa walidacja formularza tworzenia profilu kota', () => {

    beforeEach(() => {
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.visit('/select-cat');
        cy.contains('Stwórz Nowy Profil Kota').click();
    });

    it('powinien wyświetlić błędy, gdy wymagane pola (imię, waga) są puste', () => {
        cy.get('[data-cy="profile-save-button"]').click({ force: true });
        cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
        cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
    });

    context('Walidacja pola "Imię"', () => {
        beforeEach(() => {
            cy.get('input[name="currentWeight"]').clear().type('4').should('have.value', '4');
            cy.get('input[name="years"]').clear().type('2').should('have.value', '2');
        });

        it('powinien wyświetlić błąd, gdy imię jest za krótkie', () => {
            cy.get('input[name="name"]').type('A').should('have.value', 'A');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
            cy.contains('Waga musi być liczbą dodatnią.').should('not.exist');
        });

        it('powinien wyświetlić błąd, gdy imię jest za długie (> 30 znaków)', () => {
            const longName = 'a'.repeat(31);
            cy.get('input[name="name"]').type(longName).should('have.value', longName);
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Imię nie może być dłuższe niż 30 znaków.').should('be.visible');
        });
    });

    context('Walidacja pól wagowych', () => {
        beforeEach(() => {
            cy.get('input[name="name"]').clear().type('Testowy Kot').should('have.value', 'Testowy Kot');
            cy.get('input[name="years"]').clear().type('2').should('have.value', '2');
        });

        it('powinien wyświetlić błąd, gdy waga bieżąca jest ujemna', () => {
            cy.get('input[name="currentWeight"]').clear().type('-5').should('have.value', '-5');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
            cy.contains('Imię musi mieć co najmniej 2 znaki.').should('not.exist');
        });

        it('powinien wyświetlić błąd, gdy waga bieżąca jest za duża (> 20 kg)', () => {
            cy.get('input[name="currentWeight"]').clear().type('21').should('have.value', '21');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga nie może przekraczać 20 kg.').should('be.visible');
        });

        it('powinien pozwolić na zapisanie pustej wagi docelowej', () => {
            cy.get('input[name="currentWeight"]').clear().type('4').should('have.value', '4');
            cy.get('input[name="targetWeight"]').should('be.empty');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.url().should('include', '/select-cat');
            cy.contains('Profil kota został pomyślnie utworzony!').should('be.visible');
        });

        it('powinien wyświetlić błąd dla ujemnej wagi docelowej', () => {
            cy.get('input[name="currentWeight"]').clear().type('4').should('have.value', '4');
            cy.get('input[name="targetWeight"]').clear().type('-3').should('have.value', '-3');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy waga docelowa jest za duża (> 20 kg)', () => {
            cy.get('input[name="currentWeight"]').clear().type('5').should('have.value', '5');
            cy.get('input[name="targetWeight"]').clear().type('22').should('have.value', '22');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Waga nie może przekraczać 20 kg.').should('be.visible');
        });
    });

    context('Walidacja pola "Wiek"', () => {
        beforeEach(() => {
            cy.get('input[name="name"]').clear().type('Kociak').should('have.value', 'Kociak');
            cy.get('input[name="currentWeight"]').clear().type('1.5').should('have.value', '1.5');
        });

        it('powinien wyświetlić błąd, gdy lata to 0, a miesiące są puste', () => {
            cy.get('input[name="years"]').clear().type('0').should('have.value', '0');
            cy.get('input[name="months"]').should('be.visible').clear().should('have.value', '');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Dla kociaka poniżej roku podaj liczbę miesięcy.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy lata przekraczają 30', () => {
            cy.get('input[name="years"]').clear().type('31').should('have.value', '31');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Wiek nie może przekraczać 30 lat.').should('be.visible');
        });

        it('powinien wyświetlić błąd, gdy miesiące przekraczają 11', () => {
            cy.get('input[name="years"]').clear().type('0').should('have.value', '0');
            cy.get('input[name="months"]').should('be.visible').clear().type('12').should('have.value', '12');
            cy.get('[data-cy="profile-save-button"]').click({ force: true });
            cy.contains('Miesiące muszą być w zakresie od 0 do 11.').should('be.visible');
        });
    });

    // Usunięcie bloku afterEach, ponieważ poprawiony test z zapisem pustej wagi docelowej przechodzi dalej
});