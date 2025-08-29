// /src/schemas/mealSchema.js

import {z} from 'zod';

export const mealSchema = z.object({
    // 'food' to będzie obiekt z react-select, więc walidujemy jego wewnętrzne właściwości
    food: z.object({
        value: z.string().min(1, "Musisz wybrać karmę."),
        label: z.string(),
    }).nullable().refine(val => val !== null, {message: "Musisz wybrać karmę."}),

    weight: z.coerce.number({required_error: "Waga jest wymagana.", invalid_type_error: "Waga musi być liczbą."})
        .positive("Waga musi być dodatnia.")
        .max(1000, "Waga nie może być większa niż 1000g."),
});