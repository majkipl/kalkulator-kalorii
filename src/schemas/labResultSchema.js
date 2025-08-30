// /src/schemas/labResultSchema.js

import {z} from 'zod';

export const labResultSchema = z.object({
    testName: z.string()
        .min(2, "Nazwa badania musi mieć co najmniej 2 znaki.")
        .max(50, "Nazwa badania nie może być dłuższa niż 50 znaków."),
    result: z.string()
        .min(1, "Wynik jest wymagany.")
        .max(30, "Wynik nie może być dłuższy niż 30 znaków."),
    unit: z.string()
        .max(20, "Jednostka nie może być dłuższa niż 20 znaków.")
        .optional(),
    referenceRange: z.string()
        .max(30, "Zakres nie może być dłuższy niż 30 znaków.")
        .optional(),
    date: z.string({required_error: "Data jest wymagana."}),
});