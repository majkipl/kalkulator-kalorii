// /src/schemas/vetVisitSchema.js

import {z} from 'zod';

export const vetVisitSchema = z.object({
    date: z.string().min(1, "Data jest wymagana."),

    // Pole `vet` będzie obiektem z `react-select`, np. { value: 'id123', label: 'Nazwa Lecznicy' }
    // Walidujemy, czy obiekt nie jest pusty (null)
    vet: z.object({
        value: z.string(),
        label: z.string(),
    }).nullable().refine(val => val !== null, {message: "Musisz wybrać weterynarza z listy."}),

    reason: z.string()
        .min(3, "Powód wizyty musi mieć co najmniej 3 znaki.")
        .max(100, "Powód wizyty nie może być dłuższy niż 100 znaków."),
    diagnosis: z.string()
        .max(1000, "Diagnoza nie może być dłuższa niż 1000 znaków.")
        .optional().or(z.literal('')),
    recommendations: z.string()
        .max(1000, "Zalecenia nie mogą być dłuższe niż 1000 znaków.")
        .optional().or(z.literal('')),
});