// FILNAMN: src/services/apiService.js
import { quotesApiResponseSchema } from '../utils/zodSchemas';
import { mapAirtableToInternalQuote, mapInternalToAirtablePayload } from '../utils/dataMapping';

const API_BASE_URL = 'https://nordsym.app.n8n.cloud/webhook';

const apiService = {
    fetchQuotes: async () => {
        const response = await fetch(`${API_BASE_URL}/quotes`);
        if (!response.ok) throw new Error(`API-fel: ${response.status} ${response.statusText}`);
        const rawData = await response.json();
        const validatedData = quotesApiResponseSchema.parse(rawData);
        return validatedData.quotes.map(mapAirtableToInternalQuote);
    },

    saveQuote: async (internalQuote) => {
        const payload = mapInternalToAirtablePayload(internalQuote);
        const response = await fetch(`${API_BASE_URL}/quotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`API-fel vid sparande: ${response.status} ${response.statusText}`);
        return response.json();
    },

    sendProposal: async (quote) => {
        const payload = { rawId: quote.rawId, id: quote.id };
        const response = await fetch(`${API_BASE_URL}/quote/dispatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Dispatch misslyckades: ${response.statusText}`);
        return response.json();
    },

    deleteQuote: async (quoteId) => {
        const response = await fetch(`${API_BASE_URL}/quote/${quoteId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Arkivering misslyckades: ${response.statusText}`);
        try {
            return await response.json();
        } catch (e) {
            return { status: 'success', message: `Ärende ${quoteId} arkiverat.` };
        }
    },

    pollForUpdates: async () => {
        const response = await fetch(`${API_BASE_URL}/quote/customer-response`);
        if (!response.ok) return null;
        const responseText = await response.text();
        if (!responseText) return null;
        return JSON.parse(responseText);
    },
};

export default apiService;