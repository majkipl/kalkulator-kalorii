// /src/schemas/catProfileSchema.js

import {z} from 'zod';

export const catProfileSchema = z.object({
    name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki.").max(30, "Imię nie może być dłuższe niż 30 znaków."),
    currentWeight: z.coerce.number({invalid_type_error: "Waga musi być liczbą."})
        .positive("Waga musi być liczbą dodatnią.")
        .max(20, "Waga nie może przekraczać 20 kg."),
    targetWeight: z.coerce.number({invalid_type_error: "Waga musi być liczbą."})
        .positive("Waga musi być liczbą dodatnią.")
        .max(20, "Waga nie może przekraczać 20 kg.")
        .optional().or(z.literal('')), // Opcjonalne, ale jeśli jest, musi być poprawne

    // Pola, które są `select`ami, więc wystarczy sprawdzić, czy są stringami
    breed: z.string({required_error: "Musisz wybrać rasę."}),
    activityLevel: z.string({required_error: "Musisz wybrać poziom aktywności."}),
    physiologicalState: z.string({required_error: "Musisz wybrać stan fizjologiczny."}),
    chronicDisease: z.string({required_error: "Musisz wybrać chorobę przewlekłą."}),

    // Pozostałe pola, które nie wymagają skomplikowanej walidacji
    isNeutered: z.boolean(),
    years: z.coerce.number().int().min(0, "Lata nie mogą być ujemne.").max(30, "Wiek nie może przekraczać 30 lat."),
    months: z.coerce.number().int().min(0).max(11),
});