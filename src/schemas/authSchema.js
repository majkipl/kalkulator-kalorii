// /src/schemas/authSchema.js

import {z} from 'zod';

// Schemat dla logowania
export const loginSchema = z.object({
    email: z.string().email("Nieprawidłowy format adresu e-mail."),
    password: z.string().min(1, "Hasło jest wymagane."),
});

// Schemat dla rejestracji
export const registerSchema = z.object({
    email: z.string().email("Nieprawidłowy format adresu e-mail."),
    password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});

// Schemat dla resetowania hasła
export const resetSchema = z.object({
    email: z.string().email("Nieprawidłowy format adresu e-mail."),
});