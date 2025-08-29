// /src/schemas/healthLogSchema.js

import {z} from 'zod';

export const healthLogSchema = z.object({
    waterIntake: z.coerce.number({invalid_type_error: "Wartość musi być liczbą."})
        .int("Wartość musi być liczbą całkowitą.")
        .nonnegative("Wartość nie może być ujemna.")
        .max(2000, "Wartość nie może przekraczać 2000 ml.")
        .optional(),
    medications: z.string()
        .max(500, "Pole nie może być dłuższe niż 500 znaków.")
        .optional(),
    symptomTags: z.array(z.string()).optional(),
    note: z.string()
        .max(1000, "Notatki nie mogą być dłuższe niż 1000 znaków.")
        .optional(),
});