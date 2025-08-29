// /src/schemas/changePasswordSchema.js

import {z} from 'zod';

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Aktualne hasło jest wymagane."),
    newPassword: z.string().min(6, "Nowe hasło musi mieć co najmniej 6 znaków."),
    confirmPassword: z.string().min(6, "Potwierdzenie hasła musi mieć co najmniej 6 znaków."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmPassword"], // Tutaj pojawi się komunikat o błędzie
});