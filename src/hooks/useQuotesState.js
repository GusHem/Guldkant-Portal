// FILNAMN: src/hooks/useQuotesState.js
// 🔧 NordSym Atom-Smed: FINAL MVP FIX
// Updated: 2025-07-27 - Optimistic update to keep modal open on new quote.

import { useState, useCallback } from 'react';
import apiService from '../services/apiService';
import { calculateTotal } from '../utils/helpers';

const useQuotesState = (showToast) => {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const mapStatusForAirtable = (frontendStatus) => {
        const statusMapping = {
            'godkänd': 'Accepterad',
            'förslag-skickat': 'Förslag Skickat',
            'förlorad-affär': 'Förlorad Affär',
            'genomförd': 'Genomförd',
            'betald': 'Betald',
            'utkast': 'utkast'
        };
        return statusMapping[frontendStatus] || frontendStatus;
    };

    const loadQuotes = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const fetchedQuotes = await apiService.fetchQuotes();
            setQuotes(fetchedQuotes);
        } catch (error) {
            console.error("🚨 Kunde inte hämta ärenden:", error);
            setFetchError(error.message);
            setQuotes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveQuote = useCallback(async (quoteData) => {
        setIsSyncing(true);
        const isNewQuote = !quoteData.id; // Identifiera om det är ett helt nytt ärende

        const withTotal = {
            ...quoteData,
            total: calculateTotal(quoteData),
            lastUpdated: new Date().toISOString()
        };

        if (withTotal.status) {
            withTotal.status = mapStatusForAirtable(withTotal.status);
        }

        // Skapa ett temporärt ID för optimistisk uppdatering om det är ett nytt ärende
        const tempId = `temp-${Date.now()}`;
        if (isNewQuote) {
            withTotal.id = tempId;
        }

        const originalQuotes = [...quotes];

        // Optimistisk uppdatering: Lägg till/uppdatera direkt i UI
        setQuotes(prev => {
            if (isNewQuote) {
                return [...prev, withTotal];
            }
            return prev.map(q => q.id === withTotal.id ? withTotal : q);
        });

        try {
            const result = await apiService.saveQuote(quoteData); // Skicka originaldata utan tempId

            // ⭐ MODAL-FIX: Uppdatera listan smart istället för att ladda om allt.
            if (isNewQuote) {
                // När vi skapat ett nytt ärende, ersätt det temporära med det riktiga från servern.
                setQuotes(prev => prev.map(q => q.id === tempId ? result : q));
                showToast("Ärende skapat!", "success");
            } else {
                // När vi uppdaterar ett befintligt, ersätt det med den uppdaterade versionen.
                setQuotes(prev => prev.map(q => q.id === result.id ? result : q));
                showToast("Ändringar sparade!", "success");
            }

            return result;

        } catch (error) {
            console.error("🚨 Kunde inte spara ändringar:", error);
            showToast(`Kunde inte spara: ${error.message}`, "error");
            setQuotes(originalQuotes); // Återställ vid fel
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, [quotes, showToast]);

    const addNewQuote = useCallback(async () => {
        try {
            return await saveQuote({
                status: 'utkast',
                kundNamn: 'Nytt ärende',
                kontaktPerson: '',
                email: '',
                telefon: '',
                projektTyp: '',
                eventDatum: new Date().toISOString().split('T')[0],
                guestCount: 0,
                eventTid: '',
                menuPreference: '',
                eventPlats: '',
                otherRequests: '',
                dietaryNeeds: '',
                totalPris: 0
            });
        } catch (error) {
            // Felhantering sker redan i saveQuote, behöver inte visa toast igen.
            return null;
        }
    }, [saveQuote]);

    const copyAndSaveQuote = useCallback(async (quoteToCopy) => {
        try {
            const newQuoteData = JSON.parse(JSON.stringify(quoteToCopy));

            delete newQuoteData.id;
            delete newQuoteData.rawId;
            delete newQuoteData.total;
            delete newQuoteData.totalPris;
            delete newQuoteData.lastUpdated;
            delete newQuoteData.skapad;

            newQuoteData.status = 'utkast';
            newQuoteData.eventDatum = new Date().toISOString().split('T')[0];

            return await saveQuote(newQuoteData);

        } catch (error) {
            return null;
        }
    }, [saveQuote]);

    const changeQuoteStatus = useCallback(async (quoteToUpdate, newStatus) => {
        try {
            await saveQuote({ ...quoteToUpdate, status: newStatus });
        } catch (error) {
            // Tomt, saveQuote hanterar fel
        }
    }, [saveQuote]);

    const sendProposal = useCallback(async (quote) => {
        setIsSyncing(true);
        try {
            await apiService.sendProposal(quote);
            await loadQuotes(); // Ladda om här är OK, status ändras i backend.
            showToast("Offert har skickats till kund!", "success");
        } catch (error) {
            console.error("🚨 Kunde inte skicka offert:", error);
            showToast(`Kunde inte skicka offert: ${error.message}`, "error");
        } finally {
            setIsSyncing(false);
        }
    }, [loadQuotes, showToast]);

    const approveProposal = useCallback((quote) => {
        changeQuoteStatus(quote, 'godkänd');
    }, [changeQuoteStatus]);

    const deleteQuote = useCallback(async (quoteId) => {
        setIsSyncing(true);
        const originalQuotes = [...quotes];
        setQuotes(prev => prev.filter(q => q.id !== quoteId));
        try {
            await apiService.deleteQuote(quoteId);
            showToast(`Ärende ${quoteId} har arkiverats.`, "success");
        } catch (error) {
            console.error("🚨 Kunde inte arkivera ärende:", error);
            showToast(`Kunde inte arkivera: ${error.message}`, "error");
            setQuotes(originalQuotes);
        } finally {
            setIsSyncing(false);
        }
    }, [quotes, showToast]);

    return {
        quotes,
        isLoading,
        isSyncing,
        fetchError,
        loadQuotes,
        saveQuote,
        addNewQuote,
        copyAndSaveQuote,
        changeQuoteStatus,
        sendProposal,
        approveProposal,
        deleteQuote
    };
};

export default useQuotesState;
