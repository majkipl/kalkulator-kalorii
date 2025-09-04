// /cypress/e2e/cat_profile_edit.cy.js
import '../support/commands';

describe('Edycja profilu kota', () => {
    let catName;

    beforeEach(() => {
        catName = `Kot Do Edycji ${Date.now()}`;
        cy.login('oxbagx@gmail.com', 'asdf1234');

        cy.visit('/select-cat');
        cy.contains('Stwórz Nowy Profil Kota').click();
        cy.get('input[name="name"]').type(catName);
        cy.get('input[name="currentWeight"]').type('4.2');
        cy.get('input[name="years"]').type('3');
        cy.get('[data-cy="profile-save-button"]').click({force: true});

        cy.contains('Profil kota został pomyślnie utworzony!').should('be.visible');

        cy.contains('button', catName).click();
        cy.url().should('include', '/dashboard');
    });

    const openEditForm = () => {
        cy.contains('h2', 'Profil kota').click();
        cy.get('[data-cy="profile-edit-button"]').click();
    };

    it('powinien pozwolić na pomyślną edycję imienia kota', () => {
        openEditForm();

        const updatedName = `Zmienione Imię ${Date.now()}`;
        cy.get('input[name="name"]').clear().type(updatedName);
        cy.get('input[name="targetWeight"]').type('1');
        cy.get('[data-cy="profile-save-button"]').click({force: true});

        // 👇 ZMIANA: Czekamy na toast jako potwierdzenie zapisu
        cy.contains('Profil kota został zaktualizowany.').should('be.visible');

        // Teraz asercja na pewno zadziała
        cy.get('header').contains(updatedName).should('be.visible');
    });

    it('powinien pozwolić na kompleksową edycję wielu pól naraz', () => {
        openEditForm();

        const updatedName = `Super Kot ${Date.now()}`;
        cy.get('input[name="name"]').clear().type(updatedName);
        cy.get('input[name="currentWeight"]').clear().type('4.5');
        cy.get('input[name="targetWeight"]').type('1');
        cy.get('input[name="isNeutered"]').check();
        cy.get('[data-cy="profile-save-button"]').click({force: true});

        // 👇 ZMIANA: Czekamy na toast jako potwierdzenie zapisu
        cy.contains('Profil kota został zaktualizowany.').should('be.visible');

        // Teraz asercje na pewno zadziałają
        cy.get('header').contains(updatedName).should('be.visible');
        cy.contains('Aktualna waga:').parent().should('contain.text', '4.5 kg');
        cy.contains('Kastracja:').parent().should('contain.text', 'Tak');
    });

    it('powinien cofnąć zmiany po kliknięciu "Anuluj"', () => {
        openEditForm();

        cy.get('input[name="name"]').clear().type('Zmiana, która nie powinna być zapisana');
        cy.contains('button', 'Anuluj').click();
        cy.get('header').contains(catName).should('be.visible');
    });

    it('powinien wyświetlić błąd walidacji przy próbie zapisania ujemnej wagi', () => {
        openEditForm();

        cy.get('input[name="currentWeight"]').clear().type('-5');
        cy.get('[data-cy="profile-save-button"]').click({force: true});
        cy.contains('Waga musi być liczbą dodatnią.').should('be.visible');
    });
});