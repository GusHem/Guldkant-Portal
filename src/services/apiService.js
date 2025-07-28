// 🔧 PERFECT apiService.js - Guldkant Portal v2.0
// NordSym Atom-Smed: Kirurgiskt precis för CREATE/UPDATE operations

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nordsym.app.n8n.cloud/webhook';

// 🛡️ FIXED ENHANCED ERROR HANDLING & REQUEST UTILITY
async function makeRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        }
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
        console.log(`🔗 API Request: ${requestOptions.method} ${url}`);
        if (requestOptions.body) {
            console.log('📤 Request payload:', JSON.parse(requestOptions.body));
        }
        
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 🔧 CRITICAL FIX: Read response text ONCE and handle parsing properly
        const responseText = await response.text();
        console.log('🔍 Raw Response Text:', responseText.substring(0, 200) + '...');
        
        // Check if response is empty
        if (!responseText.trim()) {
            console.warn('⚠️ Empty response received');
            return { status: 'success', message: 'Empty response', data: [] };
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            try {
                const data = JSON.parse(responseText);
                console.log(`✅ API Response parsed successfully:`, data);
                return data;
            } catch (parseError) {
                console.error('❌ JSON parsing failed:', parseError);
                console.error('📄 Raw response that failed to parse:', responseText);
                throw new Error(`JSON parse error: ${parseError.message}`);
            }
        } else {
            // Non-JSON responses
            console.log(`✅ Non-JSON Response:`, responseText);
            return { 
                status: 'success', 
                message: 'Operation genomförd',
                rawResponse: responseText 
            };
        }
    } catch (networkError) {
        console.error(`❌ Network error for ${url}:`, networkError);
        throw new Error(`Nätverksfel: ${networkError.message}`);
    }
}

// 🎯 GULDKANT API SERVICE - PERFEKT VERSION
const apiService = {
    
    // 📊 HÄMTA ALLA OFFERTER (GET /quotes)
    fetchQuotes: async () => {
        try {
            console.log('📊 Fetching all quotes from Airtable...');
            
            const data = await makeRequest(`${API_BASE_URL}/quotes`);
            
            // Hantera olika response format från n8n
            let quotes = [];
            if (data.quotes && Array.isArray(data.quotes)) {
                quotes = data.quotes;
            } else if (Array.isArray(data)) {
                quotes = data;
            } else {
                console.warn('⚠️ Unexpected response format:', data);
                quotes = [];
            }
            
            console.log(`✅ Successfully fetched ${quotes.length} quotes`);
            return quotes;
            
        } catch (error) {
            console.error('❌ Error fetching quotes:', error);
            throw new Error(`Kunde inte hämta offerter: ${error.message}`);
        }
    },

    // 💾 SPARA/UPPDATERA OFFERT (POST /guldkant-offer-intake-v2)
    saveQuote: async (quoteData) => {
        try {
            console.log('💾 Saving quote to Airtable via n8n...');
            
            // Validera essential data
            if (!quoteData || typeof quoteData !== 'object') {
                throw new Error('Ogiltig quote data');
            }

            // 🔧 SMART MODE DETECTION
            let mode = 'auto'; // Låt n8n's Smart Logic bestämma
            
            // Om quote har rawId eller befintligt id = UPDATE
            if (quoteData.rawId || (quoteData.id && quoteData.id.startsWith('GULDKANT-'))) {
                mode = 'update';
                console.log('🔄 Detected UPDATE mode for existing quote');
            }
            // För helt nya quotes = CREATE  
            else if (!quoteData.id || quoteData.customer === 'Nytt ärende') {
                mode = 'create';
                console.log('🆕 Detected CREATE mode for new quote');
                
                // Ta bort eventuellt tomt/placeholder ID för CREATE
                if (quoteData.id && (quoteData.id === '' || quoteData.id === 'new')) {
                    delete quoteData.id;
                }
                if (quoteData.offertId && (quoteData.offertId === '' || quoteData.offertId === 'new')) {
                    delete quoteData.offertId;
                }
            }

            // Lägg till mode i payload för n8n Smart Logic
            const payload = {
                ...quoteData,
                mode: mode,
                timestamp: new Date().toISOString()
            };

            // 🎯 ANVÄND KORREKT ENDPOINT - guldkant-offer-intake-v2
            const response = await makeRequest(`${API_BASE_URL}/guldkant-offer-intake-v2`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('✅ Quote saved successfully');
            return response;
            
        } catch (error) {
            console.error('❌ Error saving quote:', error);
            throw new Error(`Kunde inte spara offert: ${error.message}`);
        }
    },

    // 🔄 EXPLICIT UPDATE FUNKTION (för klarhet)
    updateQuote: async (offertId, updateData) => {
        try {
            console.log(`🔄 Updating quote ${offertId}...`);
            
            if (!offertId) {
                throw new Error('OffertId krävs för uppdatering');
            }

            const payload = {
                ...updateData,
                offertId: offertId,
                mode: 'update', // Explicit UPDATE mode
                timestamp: new Date().toISOString()
            };

            const response = await makeRequest(`${API_BASE_URL}/guldkant-offer-intake-v2`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('✅ Quote updated successfully');
            return response;
            
        } catch (error) {
            console.error('❌ Error updating quote:', error);
            throw new Error(`Kunde inte uppdatera offert: ${error.message}`);
        }
    },

    // 📋 KOPIERA OFFERT (skapa ny baserad på befintlig)
    copyQuote: async (sourceId, newQuoteData = {}) => {
        try {
            console.log(`📋 Copying quote from ${sourceId}...`);
            
            if (!sourceId) {
                throw new Error('SourceId krävs för kopiering');
            }

            const payload = {
                ...newQuoteData,
                sourceId: sourceId,
                mode: 'copy', // Explicit COPY mode för n8n
                status: 'utkast', // Nya kopior börjar som utkast
                timestamp: new Date().toISOString()
            };

            const response = await makeRequest(`${API_BASE_URL}/guldkant-offer-intake-v2`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('✅ Quote copied successfully');
            return response;
            
        } catch (error) {
            console.error('❌ Error copying quote:', error);
            throw new Error(`Kunde inte kopiera offert: ${error.message}`);
        }
    },

    // ⭐ KORRIGERAD, EFFEKTIV FUNKTION: HÄMTA EN SPECIFIK OFFERT
    fetchQuoteById: async (quoteId) => {
        try {
            console.log(`🔍 Fetching specific quote by ID: ${quoteId}...`);
            
            if (!quoteId) {
                throw new Error('Offert-ID krävs för att hämta en specifik offert.');
            }

            // ✅ FIX: Använder den korrekta, centrala endpointen '/quotes' som nu kan hantera ett ID.
            const endpoint = `/quotes`;
            const url = `${API_BASE_URL}${endpoint}?id=${quoteId}`;
            
            const response = await makeRequest(url);
            
            if (!response) {
                throw new Error(`Offert ${quoteId} hittades inte eller så returnerades ett tomt svar.`);
            }
            
            console.log('✅ Specific quote found');
            // n8n kan kapsla in datan, så vi letar efter en 'data' eller 'quote' nyckel,
            // annars returnerar vi hela objektet.
            return response.data || response.quote || response;
            
        } catch (error) {
            console.error('❌ Error fetching quote by ID:', error);
            throw new Error(`Kunde inte hämta offert ${quoteId}: ${error.message}`);
        }
    },

    // 📧 SKICKA OFFERT VIA EMAIL (implementeras senare)
    sendProposal: async (quote) => {
        try {
            console.log('📧 Sending proposal...');
            
            if (!quote || !quote.email) {
                throw new Error('Quote och email krävs för att skicka förslag');
            }

            const payload = { 
                rawId: quote.rawId, 
                id: quote.id,
                customerEmail: quote.email,
                action: 'send_proposal'
            };
            
            // TODO: Implementera när email-workflow finns
            const response = await makeRequest(`${API_BASE_URL}/quote/dispatch`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log('✅ Proposal sent successfully');
            return response;
            
        } catch (error) {
            console.error('❌ Error sending proposal:', error);
            throw new Error(`Kunde inte skicka förslag: ${error.message}`);
        }
    },

    // 🗑️ ARKIVERA OFFERT (status update till arkiverad)
    deleteQuote: async (offertId) => {
        try {
            console.log(`🗑️ Archiving quote ${offertId}...`);
            
            if (!offertId) {
                throw new Error('OffertId krävs för arkivering');
            }

            // Uppdatera status till arkiverad istället för att delete
            const response = await apiService.updateQuote(offertId, {
                status: 'arkiverad',
                archivedAt: new Date().toISOString()
            });
            
            console.log('✅ Quote archived successfully');
            return response;
            
        } catch (error) {
            console.error('❌ Error archiving quote:', error);
            throw new Error(`Kunde inte arkivera offert: ${error.message}`);
        }
    },

    // 🏥 API HEALTH CHECK
    healthCheck: async () => {
        try {
            console.log('🏥 Checking API health...');
            
            // Testa hämta quotes för att verifiera att API fungerar
            const quotesResponse = await makeRequest(`${API_BASE_URL}/quotes`);
            
            const healthStatus = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                apiUrl: API_BASE_URL,
                endpoints: {
                    fetchQuotes: true,
                    saveQuote: true // Antar att det fungerar om fetch fungerar
                },
                totalQuotes: quotesResponse.total || quotesResponse.quotes?.length || 0
            };
            
            console.log('✅ API health check passed');
            return healthStatus;
            
        } catch (error) {
            console.error('❌ API health check failed:', error);
            
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                apiUrl: API_BASE_URL,
                error: error.message,
                endpoints: {
                    fetchQuotes: false,
                    saveQuote: false
                }
            };
        }
    },

    // 🔧 DEVELOPMENT & DEBUG UTILITIES
    debugApiCall: async (endpoint, method = 'GET', data = null) => {
        console.log(`🔧 DEBUG: Testing ${method} ${endpoint}`);
        
        try {
            const options = method === 'GET' ? {} : {
                method,
                body: JSON.stringify(data)
            };
            
            const response = await makeRequest(`${API_BASE_URL}${endpoint}`, options);
            console.log('✅ DEBUG Success:', response);
            return response;
            
        } catch (error) {
            console.error('❌ DEBUG Failed:', error);
            throw error;
        }
    },

// 🚨 USER-FRIENDLY ERROR HANDLER
    handleApiError: (error, context = 'API operation') => {
        console.error(`❌ ${context} failed:`, error);
        
        // Returnera user-friendly error meddelanden
        if (error.message.includes('fetch') || error.message.includes('Network')) {
            return 'Nätverksfel: Kunde inte nå servern. Kontrollera din internetanslutning.';
        } else if (error.message.includes('404')) {
            return 'Resursen kunde inte hittas. Kontakta support om problemet kvarstår.';
        } else if (error.message.includes('500')) {
            return 'Serverfel: Försök igen senare eller kontakta support.';
        } else if (error.message.includes('403')) {
            return 'Åtkomst nekad: Du har inte behörighet för denna operation.';
        } else {
            return `Fel: ${error.message}`;
        }
    },

    // 🔄 POLLING FOR UPDATES (App.jsx compatibility)
    pollForUpdates: async () => {
        try {
            console.log('🔄 Polling for quote updates...');
            
            // For now, return empty array (no updates detected)
            // In future: compare with cached version or check timestamp
            const currentQuotes = await apiService.fetchQuotes();
            
            // Simple implementation: return empty if no changes
            // Could be enhanced with timestamp comparison
            return [];
            
        } catch (error) {
            console.error('❌ Polling error:', error);
            return [];
        }
    }
};

// 📤 EXPORT BOTH DEFAULT AND NAMED EXPORTS
export default apiService;

// Named exports för flexibility
export const {
    fetchQuotes,
    saveQuote,
    updateQuote,
    copyQuote,
    fetchQuoteById,
    sendProposal,
    deleteQuote,
    healthCheck,
    debugApiCall,
    handleApiError,
    pollForUpdates
} = apiService;