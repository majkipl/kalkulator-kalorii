// /src/__tests__/components/CatProfileForm.test.js

import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatProfileForm from '../../components/CatProfileForm';
import {AppProvider} from '../../context/AppContext'; // Potrzebny dla hooka isDark

// Komponent pomocniczy do renderowania z wymaganymi providerami
const renderWithProviders = (ui) => {
    return render(<AppProvider>{ui}</AppProvider>);
};

describe('CatProfileForm', () => {
    const onSaveMock = jest.fn();
    const onCancelMock = jest.fn();

    beforeEach(() => {
        // Resetujemy mocki przed każdym testem
        jest.clearAllMocks();
    });

    test('powinien renderować formularz tworzenia i mieć puste pola', () => {
        renderWithProviders(<CatProfileForm onSave={onSaveMock} onCancel={onCancelMock}/>);

        expect(screen.getByRole('heading', {name: /stwórz nowy profil/i})).toBeInTheDocument();
        expect(screen.getByLabelText(/nazwa kota/i)).toHaveValue('');
        expect(screen.getByRole('button', {name: /zapisz/i})).toBeInTheDocument();
    });

    test('powinien wyświetlać błędy walidacji dla pustych wymaganych pól', async () => {
        renderWithProviders(<CatProfileForm onSave={onSaveMock} onCancel={onCancelMock}/>);

        const saveButton = screen.getByRole('button', {name: /zapisz/i});
        await userEvent.click(saveButton);

        // Oczekujemy na pojawienie się komunikatów o błędach
        expect(await screen.findByText(/imię musi mieć co najmniej 2 znaki/i)).toBeInTheDocument();
        expect(screen.getByText(/waga musi być liczbą dodatnią/i)).toBeInTheDocument();

        // Funkcja zapisu nie powinna zostać wywołana
        expect(onSaveMock).not.toHaveBeenCalled();
    });

    test('powinien wywołać onSave z poprawnymi danymi po wysłaniu walidowanego formularza', async () => {
        renderWithProviders(<CatProfileForm onSave={onSaveMock} onCancel={onCancelMock}/>);

        await userEvent.type(screen.getByLabelText(/nazwa kota/i), 'Mruczek');
        await userEvent.type(screen.getByLabelText(/aktualna waga/i), '4.5');
        await userEvent.type(screen.getByLabelText(/wiek \(lata\)/i), '3');
        await userEvent.type(screen.getByLabelText(/miesiące/i), '6');

        await userEvent.click(screen.getByRole('button', {name: /zapisz/i}));

        expect(onSaveMock).toHaveBeenCalledTimes(1);
        expect(onSaveMock).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Mruczek',
            currentWeight: 4.5,
            age: 3.5, // 3 lata i 6 miesięcy
            breed: 'mieszany', // Wartość domyślna
        }));
    });

    test('powinien wywołać onCancel po kliknięciu przycisku "Anuluj"', async () => {
        renderWithProviders(<CatProfileForm onSave={onSaveMock} onCancel={onCancelMock}/>);

        await userEvent.click(screen.getByRole('button', {name: /anuluj/i}));

        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
});