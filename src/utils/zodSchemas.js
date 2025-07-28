// FILNAMN: src/utils/zodSchemas.js
// 🔧 NordSym Atom-Smed: Precision Fixed Zod Schemas
// Updated: 2025-01-24 - Surgical Correction

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

// 🎯 CRITICAL FIX: n8n returnerar {quotes: [...]} INTE direkt array
export const quotesApiResponseSchema = z.object({
    quotes: z.array(airtableQuoteSchema),
});

// 🔧 ALTERNATIVE: Direct array schema för fallback
export const quotesApiDirectArraySchema = z.array(airtableQuoteSchema);

// 🎯 EXPORT för useQuoteState.js usage - REVERSED ORDER
export const validateQuotesResponse = (data) => {
    try {
        // 🔍 Try nested object FIRST (actual n8n response format)
        const nested = quotesApiResponseSchema.parse(data);
        return nested.quotes;
    } catch (error) {
        try {
            // 🔍 Fallback to direct array
            return quotesApiDirectArraySchema.parse(data);
        } catch (arrayError) {
            console.error('🚨 Zod Validation Failed:', error.message);
            console.error('🚨 Raw data received:', data);
            throw new Error(`Invalid API response format: ${error.message}`);
        }
    }
};