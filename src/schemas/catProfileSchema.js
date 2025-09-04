// /src/schemas/catProfileSchema.js

import {z} from 'zod';

export const catProfileSchema = z.object({
    name: z.string({
        required_error: "Imię kota jest wymagane.",
        invalid_type_error: "Wprowadzona wartość musi być tekstem."
    })
        .min(2, "Imię musi mieć co najmniej 2 znaki.")
        .max(30, "Imię nie może być dłuższe niż 30 znaków."),
    currentWeight: z.coerce.number({invalid_type_error: "Waga musi być liczbą."})
        .positive("Waga musi być liczbą dodatnią.")
        .max(20, "Waga nie może przekraczać 20 kg."),

    // 👇 ZMIANA TUTAJ: Nowa, poprawna logika dla opcjonalnej wagi docelowej
    targetWeight: z.union([
        z.string().length(0), // Akceptuj pusty string
        z.coerce.number()
            .positive("Waga musi być liczbą dodatnią.")
            .max(20, "Waga nie może przekraczać 20 kg.")
    ]).optional().or(z.literal('')), // Upewnij się, że jest opcjonalne
    // Koniec zmiany 👆

    // ... reszta pól bez zmian
    breed: z.string({required_error: "Musisz wybrać rasę."}),
    activityLevel: z.string({required_error: "Musisz wybrać poziom aktywności."}),
    physiologicalState: z.string({required_error: "Musisz wybrać stan fizjologiczny."}),
    chronicDisease: z.string({required_error: "Musisz wybrać chorobę przewlekłą."}),
    isNeutered: z.boolean(),
    years: z.coerce.number({
        required_error: "Wiek (lata) jest wymagany.",
        invalid_type_error: "Wiek (lata) musi być liczbą."
    }).int().min(0, "Lata nie mogą być ujemne.").max(30, "Wiek nie może przekraczać 30 lat."),
    months: z.coerce.number({
        required_error: "Wiek (miesiące) jest wymagany.",
        invalid_type_error: "Wiek (miesiące) musi być liczbą."
    }).int().min(0, "Miesiące nie mogą być ujemne.").max(11, "Miesiące muszą być w zakresie od 0 do 11."),
}).refine(data => {
    if (Number(data.years) === 0) {
        return data.months !== undefined && data.months > 0;
    }
    return true;
}, {
    message: "Dla kociaka poniżej roku podaj liczbę miesięcy.",
    path: ["months"],
});