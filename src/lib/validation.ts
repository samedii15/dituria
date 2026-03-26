import { z } from "zod";

export const entryInputSchema = z.object({
  sectionId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  bookId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  title: z.string().min(2),
  content: z.string().min(10),
  arabicText: z.string().optional().nullable(),
  hadithNumber: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  tags: z.array(z.string().min(1)).default([]),
  isPublished: z.boolean().default(false),
  forceSave: z.boolean().default(false),
});

export type EntryInput = z.infer<typeof entryInputSchema>;

export const sectionInputSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  intro: z.string().optional().nullable(),
});

export const categoryInputSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
});

export const bookInputSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
});

export const chapterInputSchema = z.object({
  bookId: z.string().min(1),
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  order: z.number().int().min(0).default(0),
});

export const surahInputSchema = z.object({
  number: z.number().min(1).max(114),
  name: z.string().min(2),
});

export const ayahInputSchema = z.object({
  surahId: z.string(),
  number: z.number().min(1),
  arabicText: z.string().optional().nullable(),
  text: z.string().min(2),
});

export function parseTags(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}
