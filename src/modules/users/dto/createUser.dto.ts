import * as z from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Nome é Obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['CLIENT', 'ADMIN']).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
