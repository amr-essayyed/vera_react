// interface Post {
//     userId: number,
//     id: number,
//     title: string,
//     body: string,
// };

import { z } from "zod";

export const postSchema = z.object({
  userId: z.number().int(),
  id: z.number().int(),
  title: z.string(),
  body: z.string(),
});

export type Post = z.infer<typeof postSchema>;