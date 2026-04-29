import * as z from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Nome é Obrigatório').optional(),
  email: z.string().email('Endereço de email inválido').optional(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional(),
  role: z.enum(['CLIENT', 'ADMIN']).optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é Obrigatório').optional(),
  email: z.string().email('Endereço de email inválido').optional(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
