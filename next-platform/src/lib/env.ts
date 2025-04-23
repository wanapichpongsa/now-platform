"use server";

import z from "zod";

// not as free as process.env.VARNAME! but centralised error messages :)
const envSchema = z.object({
  REDIS_URL: z.string().trim().min(1),
  SENTRY_AUTH_TOKEN: z.string().trim().min(1), // probs remove soon
  OPENAI_API_KEY: z.string().trim().min(1),
  PINECONE_API_KEY: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);