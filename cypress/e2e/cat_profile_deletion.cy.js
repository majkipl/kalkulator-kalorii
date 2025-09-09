// /cypress/e2e/cat_profile_deletion.cy.js


import '../support/commands';

describe('Zarządzanie profilem kota - Tworzenie i Usuwanie', () => {
    // Wspólne dane użytkownika dla wszystkich testów w tym pliku
    const user = {
        email: 'oxbagx@gmail.com',
        password: 'asdf1234',
    };

    // --- Grupa 1: Test obejmujący pełen cykl życia profilu ---
    context('Kompletny cykl życia profilu', () => {
        beforeEach(() => {
            // Dla tego testu wystarczy się zalogować. Profil jest tworzony wewnątrz testu.
            cy.login(user.email, user.password);
        });

        it('powinien pozwolić na stworzenie i pomyślne usunięcie profilu kota', () => {
            const newCatName = `Testowy Kot ${Date.now()}`;

            // --- Tworzenie profilu ---
            cy.contains('Wybierz profil lub stwórz nowy').should('be.visible');
            cy.contains('Stwórz Nowy Profil Kota').click();

            cy.get('input[name="name"]').type(newCatName);
            cy.get('input[name="currentWeight"]').type('4');
            cy.get('input[name="years"]').type('2');
            cy.get('[data-cy="profile-save-button"]').click();

            // --- Asercja po stworzeniu ---
            cy.contains('button', newCatName, {timeout: 10000}).should('be.visible');

            // --- Przejście do dashboardu ---
            cy.contains('button', newCatName).click();
            cy.url().should('include', '/dashboard');

            // --- Inicjacja i potwierdzenie usunięcia ---
            cy.contains('h2', 'Profil kota').click();
            cy.get('[data-cy="profile-edit-button"]').click();
            cy.contains('button', 'Usuń Profil Kota').click();
            cy.get('input[placeholder="Twoje hasło"]').type(user.password);
            cy.contains('button', 'Potwierdź usunięcie').click();

            // --- Asercja po usunięciu ---
            cy.url().should('include', '/select-cat');
            cy.contains('Profil kota został trwale usunięty').should('be.visible');
            cy.contains(newCatName).should('not.exist');
        });
    });

    // --- Grupa 2: Testy dla przypadków brzegowych podczas usuwania ---
    context('Scenariusze anulowania i błędów przy usuwaniu', () => {
        let newCatName;

        beforeEach(() => {
            // Dla tych testów musimy najpierw stworzyć profil, aby móc testować na nim proces usuwania.
            newCatName = `Kot Do Usunięcia ${Date.now()}`;

            cy.login(user.email, user.password);
            cy.url().should('include', '/select-cat');

            cy.contains('Stwórz Nowy Profil Kota').click();
            cy.get('input[name="name"]').type(newCatName);
            cy.get('input[name="currentWeight"]').type('4');
            cy.get('input[name="years"]').type('2');
            cy.get('[data-cy="profile-save-button"]').click();

            cy.contains('button', newCatName, {timeout: 10000}).should('be.visible').click();
            cy.url().should('include', '/dashboard');

            // Otwieramy formularz edycji, aby przyciski usuwania były dostępne dla testów
            cy.contains('h2', 'Profil kota').click();
            cy.get('[data-cy="profile-edit-button"]').click();
            cy.contains('h2', 'Edytuj profil').should('be.visible');
        });

        it('powinien pozwolić na anulowanie procesu usuwania profilu', () => {
            cy.contains('button', 'Usuń Profil Kota').click();
            cy.contains('Czy na pewno usunąć profil?').should('be.visible');

            // Klikamy "Anuluj" w modalu
            cy.get('.fixed.inset-0').contains('button', 'Anuluj').click();

            // Sprawdzamy, czy modal zniknął, a profil nadal istnieje
            cy.contains('Czy na pewno usunąć profil?').should('not.exist');
            cy.contains('h2', 'Edytuj profil').should('be.visible');
            cy.contains('button', 'Anuluj').click(); // Anulujemy edycję
            cy.get('header').contains(newCatName).should('be.visible');
        });

        it('powinien wyświetlić błąd i nie usuwać profilu po wpisaniu nieprawidłowego hasła', () => {
            cy.contains('button', 'Usuń Profil Kota').click();

            // Wpisujemy złe hasło
            cy.get('input[placeholder="Twoje hasło"]').type('zupelniezlykod');
            cy.contains('button', 'Potwierdź usunięcie').click();

            // Sprawdzamy, czy pojawił się błąd i czy profil nadal istnieje
            cy.contains('Nieprawidłowe hasło.').should('be.visible');
            cy.contains('Czy na pewno usunąć profil?').should('be.visible');

            cy.get('.fixed.inset-0').contains('button', 'Anuluj').click();
            cy.contains('button', 'Anuluj').click();
            cy.get('header').contains(newCatName).should('be.visible');
        });
    });
});