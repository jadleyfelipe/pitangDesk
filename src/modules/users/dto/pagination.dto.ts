import * as z from 'zod';
export const paginationSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type PaginationDTO = z.infer<typeof paginationSchema>;
