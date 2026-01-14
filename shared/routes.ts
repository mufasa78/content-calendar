import { z } from 'zod';
import { insertContentItemSchema, contentItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  content: {
    list: {
      method: 'GET' as const,
      path: '/api/content',
      responses: {
        200: z.array(z.custom<typeof contentItems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/content/:id',
      responses: {
        200: z.custom<typeof contentItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/content',
      input: insertContentItemSchema,
      responses: {
        201: z.custom<typeof contentItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/content/:id',
      input: insertContentItemSchema.partial(),
      responses: {
        200: z.custom<typeof contentItems.$inferSelect>(),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/content/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
