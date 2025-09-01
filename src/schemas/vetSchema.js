// /src/schemas/vetSchema.js

import { z } from 'zod';

export const vetSchema = z.object({
    clinicName: z.string()
        .min(3, "Nazwa lecznicy musi mieć co najmniej 3 znaki.")
        .max(100, "Nazwa lecznicy nie może być dłuższa niż 100 znaków."),
    vetName: z.string()
        .max(100, "Imię i nazwisko nie może być dłuższe niż 100 znaków.")
        .optional(),
    address: z.string()
        .max(200, "Adres nie może być dłuższy niż 200 znaków.")
        .optional(),
    phone: z.string()
        .max(30, "Numer telefonu nie może być dłuższy niż 30 znaków.")
        .optional(),
    notes: z.string()
        .max(500, "Notatki nie mogą być dłuższe niż 500 znaków.")
        .optional(),
});