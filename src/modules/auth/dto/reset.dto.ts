import * as z from 'zod';

export const ResetSchema = z.object({
  email: z.string().email('Endereço de email inválido'),
  token: z.string().regex(/^\d{6}$/, 'Token deve conter exatamente 6 dígitos'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type ResetDTO = z.infer<typeof ResetSchema>;
