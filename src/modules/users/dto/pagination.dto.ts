import * as z from 'zod';
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type PaginationDTO = z.infer<typeof paginationSchema>;
