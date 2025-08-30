// /src/schemas/vetVisitSchema.js

import {z} from 'zod';

export const vetVisitSchema = z.object({
    date: z.string({required_error: "Data jest wymagana."}),
    reason: z.string()
        .min(3, "Powód wizyty musi mieć co najmniej 3 znaki.")
        .max(100, "Powód wizyty nie może być dłuższy niż 100 znaków."),
    diagnosis: z.string()
        .max(1000, "Diagnoza nie może być dłuższa niż 1000 znaków.")
        .optional(),
    recommendations: z.string()
        .max(1000, "Zalecenia nie mogą być dłuższe niż 1000 znaków.")
        .optional(),
});