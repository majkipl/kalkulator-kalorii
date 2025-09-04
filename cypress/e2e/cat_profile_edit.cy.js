// cypress/e2e/cat_profile_edit.cy.js
import '../support/commands';

describe('Edycja profilu kota', () => {
    let catName;

    beforeEach(() => {
        catName = `Kot Do Edycji ${Date.now()}`;
        cy.login('oxbagx@gmail.com', 'asdf1234');
        cy.visit('/select-cat');

        cy.contains('Stwórz Nowy Profil Kota').click();
        cy.get('input[name="name"]').type(catName);
        cy.get('input[name="currentWeight"]').type('4');
        cy.get('input[name="targetWeight"]').type('4');
        cy.get('input[name="years"]').type('2');

        // ZMIANA 1: Używamy nowego selektora
        cy.get('[data-cy="profile-save-button"]').click({ force: true });

        cy.contains('button', catName).click();
        cy.url().should('include', '/dashboard');
    });

    it('powinien pozwolić na pomyślną edycję danych kota', () => {
        cy.get('h2').contains('Profil kota').parent().find('button[aria-label="Edytuj"]').click();

        cy.get('input[name="name"]').should('have.value', catName);
        const updatedName = `Zmienione Imię ${Date.now()}`;
        cy.get('input[name="name"]').clear().type(updatedName);

        // ZMIANA 2: Używamy nowego selektora
        cy.get('[data-cy="profile-save-button"]').click({ force: true });

        // Asercje bez zmian
        cy.get('[data-cy="profile-save-button"]').should('not.exist');
        cy.get('header').contains(updatedName).should('be.visible');
    });

    it('powinien wyświetlić błąd walidacji przy próbie zapisania pustego imienia', () => {
        cy.get('h2').contains('Profil kota').parent().find('button[aria-label="Edytuj"]').click();
        cy.get('input[name="name"]').clear();

        // ZMIANA 3: Używamy nowego selektora
        cy.get('[data-cy="profile-save-button"]').click({ force: true });

        // Asercje bez zmian
        cy.contains('Imię musi mieć co najmniej 2 znaki.').should('be.visible');
        cy.get('header').contains(catName).should('be.visible');
    });
});