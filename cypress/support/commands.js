// cypress/support/commands.js

Cypress.Commands.add('addFoodViaUI', (food) => {
    cy.get('h2').contains('Narzędzia').click();
    cy.contains('button', 'Dodaj nową karmę').click();

    cy.get('input[name="name"]').type(food.name);
    cy.get('input[name="calories"]').type(food.calories);

    cy.get('form').contains('button', 'Dodaj karmę').click();

    // Poczekaj na toast i zamknij modal, klikając gdzieś z boku
    cy.contains('Nowa karma została dodana.').should('be.visible');
    cy.get('body').click(5, 5); // Kliknij w lewy górny róg, aby zamknąć modal
});

Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login');
    cy.get('input[placeholder="Adres e-mail"]').type(email);
    cy.get('input[placeholder="Hasło"]').type(password);
    cy.get('button[type="submit"]').contains('Zaloguj się').click();

    // Ta asercja jest kluczowa - upewnia się, że logowanie się powiodło
    // zanim test przejdzie dalej.
    cy.url().should('include', '/select-cat');
});
