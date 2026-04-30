import { z } from "zod";

/**
 * Reserved for future query validation on documentation routes (e.g. spec format).
 */
export const docsQuerySchema = z.object({});

export type DocsQuery = z.infer<typeof docsQuerySchema>;
