import {z} from 'zod';

export const currencySchema = z.object({
    id: z.number(),
    name: z.string(),
    symbol: z.string(),
    rate: z.float32(),
});

export const currencyKeys = Object.keys(currencySchema.shape);