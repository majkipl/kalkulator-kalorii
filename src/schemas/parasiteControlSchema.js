// /src/schemas/parasiteControlSchema.js

import {z} from 'zod';

export const parasiteControlSchema = z.object({
    date: z.string({required_error: "Data jest wymagana."}),
    productName: z.string()
        .min(2, "Nazwa musi mieć co najmniej 2 znaki.")
        .max(100, "Nazwa nie może być dłuższa niż 100 znaków."),
    nextDueDate: z.string().optional(),
});