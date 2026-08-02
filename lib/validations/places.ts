import * as z from 'zod';

export const addPlaceSchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
