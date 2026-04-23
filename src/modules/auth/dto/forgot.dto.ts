import * as z from 'zod';

export const ForgotSchema = z.object({
  email: z.string().email('Endereço de email inválido'),
});

export type ForgotDTO = z.infer<typeof ForgotSchema>;
