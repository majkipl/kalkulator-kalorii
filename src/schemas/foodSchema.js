// /src/schemas/foodSchema.js

import {z} from 'zod';

export const foodSchema = z.object({
    name: z.string()
        .min(3, "Nazwa musi mieć co najmniej 3 znaki.")
        .max(50, "Nazwa nie może być dłuższa niż 50 znaków."),
    calories: z.coerce.number({
        required_error: "Kaloryczność jest wymagana.",
        invalid_type_error: "Kaloryczność musi być liczbą."
    })
        .positive("Kaloryczność musi być liczbą dodatnią.")
        .max(1000, "Kaloryczność nie może być wyższa niż 1000 kcal/100g."),
    type: z.string(), // Zakładamy, że to pole jest zawsze wybrane
    photoURL: z.string().optional(),
});