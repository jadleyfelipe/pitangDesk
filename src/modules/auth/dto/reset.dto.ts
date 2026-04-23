import * as z from 'zod';

export const ResetSchema = z.object({
  email: z.string().email('Endereço de email inválido'),
  token: z
    .string()
    .min(1, 'Token é Obrigatório')
    .max(6, 'Token deve ter no máximo 6 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type ResetDTO = z.infer<typeof ResetSchema>;
