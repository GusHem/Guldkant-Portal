// FILNAMN: src/utils/zodSchemas.js
import * as z from 'zod';

export const airtableQuoteSchema = z.object({
    id: z.string(),
    rawId: z.string(),
    kundNamn: z.string().nullable().optional(),
    kontaktPerson: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    telefon: z.string().nullable().optional(),
    projektTyp: z.string().nullable().optional(),
    eventDatum: z.string().nullable().optional(),
    guestCount: z.number().nullable().optional(),
    totalPris: z.number().nullable().optional(),
    status: z.string().nullable().optional(),
    eventTid: z.string().nullable().optional(),
    menuPreference: z.string().nullable().optional(),
    eventPlats: z.string().nullable().optional(),
    otherRequests: z.string().nullable().optional(),
    dietaryNeeds: z.string().nullable().optional(),
    lastUpdated: z.coerce.date(),
    skapad: z.coerce.date(),
});

export const quotesApiResponseSchema = z.object({
    quotes: z.array(airtableQuoteSchema),
});