// cypress.config.js

const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

        // Zamiast polegać na zewnętrznym pliku support, importujemy komendy bezpośrednio tutaj.
        // To najbardziej niezawodna metoda.
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        supportFile: false, // Wyłączamy domyślny supportFile, aby uniknąć konfliktów
    },
});