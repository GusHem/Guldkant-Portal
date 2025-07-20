// FILNAMN: src/hooks/useQuotesState.js
import { useState, useCallback } from 'react';
import apiService from '../services/apiService';
import { calculateTotal } from '../utils/helpers';

const useQuotesState = (showToast) => {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const loadQuotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedQuotes = await apiService.fetchQuotes();
            setQuotes(fetchedQuotes);
            setFetchError(null);
        } catch (error) {
            console.error("Kunde inte hämta ärenden:", error);
            setFetchError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveQuote = useCallback(async (quoteData) => {
        setIsSyncing(true);
        const withTotal = { ...quoteData, total: calculateTotal(quoteData), lastUpdated: new Date().toISOString() };
        const originalQuotes = quotes;
        
        // Optimistic update
        if (quoteData.id) {
            setQuotes(prev => prev.map(q => q.id === withTotal.id ? withTotal : q));
        } else {
            setQuotes(prev => [...prev, { ...withTotal, id: `temp-${Date.now()}` }]);
        }

        try {
            await apiService.saveQuote(withTotal);
            await loadQuotes(); // Reload to get the final data from the server
            showToast("Ändringar sparade!", "success");
        } catch (error) {
            console.error("Kunde inte spara ändringar:", error);
            showToast(`Kunde inte spara: ${error.message}`, "error");
            setQuotes(originalQuotes); // Revert on failure
        } finally {
            setIsSyncing(false);
        }
    }, [quotes, loadQuotes, showToast]);

    const addNewQuote = useCallback(async () => {
        await saveQuote({ 
            status: 'utkast', 
            customer: 'Nytt ärende', 
            eventDate: new Date().toISOString().split('T')[0] 
        });
    }, [saveQuote]);

    const copyAndSaveQuote = useCallback(async (quoteToCopy) => {
        const newQuoteData = { 
            ...JSON.parse(JSON.stringify(quoteToCopy)), 
            rawId: null, 
            status: 'utkast', 
            eventDate: new Date().toISOString().split('T')[0] 
        };
        delete newQuoteData.id;
        delete newQuoteData.total;
        await saveQuote(newQuoteData);
        showToast('Ärendet kopierades och sparas som nytt utkast!', 'success');
    }, [saveQuote, showToast]);

    const changeQuoteStatus = useCallback((quoteToUpdate, newStatus) => {
        saveQuote({ ...quoteToUpdate, status: newStatus });
    }, [saveQuote]);
    
    const sendProposal = useCallback(async (quote) => {
        setIsSyncing(true);
        try {
            await apiService.sendProposal(quote);
            await loadQuotes();
            showToast("Offert har skickats till kund!", "success");
        } catch (error) {
            console.error("Kunde inte skicka offert:", error);
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
        const originalQuotes = quotes;
        setQuotes(prev => prev.filter(q => q.id !== quoteId)); // Optimistic update
        try {
            await apiService.deleteQuote(quoteId);
            showToast(`Ärende ${quoteId} har arkiverats.`, "success");
        } catch (error) {
            console.error("Kunde inte arkivera ärende:", error);
            showToast(`Kunde inte arkivera: ${error.message}`, "error");
            setQuotes(originalQuotes); // Revert on failure
        } finally {
            setIsSyncing(false);
        }
    }, [quotes, showToast]);

    return { quotes, isLoading, isSyncing, fetchError, loadQuotes, saveQuote, addNewQuote, copyAndSaveQuote, changeQuoteStatus, sendProposal, approveProposal, deleteQuote };
};

export default useQuotesState;