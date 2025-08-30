// /src/schemas/weightSchema.js

import {z} from 'zod';

export const weightSchema = z.object({
    newWeight: z.coerce.number({required_error: "Waga jest wymagana.", invalid_type_error: "Waga musi być liczbą."})
        .positive("Waga musi być dodatnia.")
        .max(20, "Waga nie może przekraczać 20 kg."),
});