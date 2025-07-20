import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ThemeContext, themes } from './contexts/ThemeContext.jsx';
import useQuotesState from './hooks/useQuotesState.js';
import apiService from './services/apiService.js';
import SimpleLoginScreen from './components/auth/SimpleLoginScreen.jsx';
import Header from './components/layout/Header.jsx';
import MainNav from './components/layout/MainNav.jsx';
import QuotesDashboard from './components/dashboard/QuotesDashboard.jsx';
import AiLog from './components/dashboard/AiLog.jsx';
import AnalyticsPlaceholder from './components/dashboard/AnalyticsPlaceholder.jsx';
import EditModal from './components/modals/EditModal.jsx';
import ConfirmationModal from './components/modals/ConfirmationModal.jsx';
import NordSymSupportHub from './components/modals/NordSymSupportHub.jsx';
import Toast from './components/common/Toast.jsx';

function App() {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const classes = themes[theme];
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeView, setActiveView] = useState('quotes');
    const [filter, setFilter] = useState('alla');
    const [searchTerm, setSearchTerm] = useState('');
    const searchRef = useRef(null);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const [confirmationState, setConfirmationState] = useState({ isOpen: false });
    const [isHubOpen, setIsHubOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        clearTimeout(toastTimer.current);
        setToast({ id: Date.now(), message, type });
        toastTimer.current = setTimeout(() => setToast(null), 5000);
    }, []);

    const { quotes, isLoading, isSyncing, fetchError, loadQuotes, saveQuote, addNewQuote, copyAndSaveQuote, changeQuoteStatus, sendProposal, approveProposal, deleteQuote } = useQuotesState(showToast);

    useEffect(() => {
        if (isLoggedIn) {
            loadQuotes();
            const intervalId = setInterval(async () => {
                try {
                    const updates = await apiService.pollForUpdates();
                    if (updates && Array.isArray(updates) && updates.length > 0) {
                        showToast(`${updates.length} ärende(n) har uppdaterats av kunder.`, 'success');
                        await loadQuotes();
                    }
                } catch (error) {
                    console.error("Polling-fel:", error);
                }
            }, 30000);
            return () => clearInterval(intervalId);
        }
    }, [isLoggedIn, loadQuotes, showToast]);

    const handleLogin = () => setIsLoggedIn(true);
    const handleSelectQuote = (quote) => setSelectedQuote(quote);
    const handleCloseModal = () => setSelectedQuote(null);
    
    const handleDeleteAction = async (quoteToDelete) => {
        await deleteQuote(quoteToDelete.id);
        setConfirmationState({ isOpen: false });
        handleCloseModal();
    };

    const requestDeleteConfirmation = (quote) => {
        setConfirmationState({ isOpen: true, title: 'Arkivera Ärende?', message: `Är du säker på att du vill arkivera ärendet "${quote.customer}" (${quote.id})? Detta flyttar det till arkivet.`, onConfirm: () => handleDeleteAction(quote), confirmText: 'Ja, arkivera', confirmButtonClass: 'bg-red-600 text-white hover:bg-red-700' });
    };

    const requestSendConfirmation = (quote) => {
        setConfirmationState({ isOpen: true, title: 'Skicka Förslag?', message: `Detta kommer att skicka ett e-postmeddelande till kunden (${quote.contactEmail}) och ändra status. Är du säker?`, onConfirm: () => { sendProposal(quote); handleCloseModal(); }, confirmText: 'Ja, skicka', confirmButtonClass: `${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover}` });
    };
    
    const requestApproveConfirmation = (quote) => {
        setConfirmationState({ isOpen: true, title: 'Godkänn Förslag Manuellt?', message: `Är du säker på att du vill godkänna detta förslag? Statusen kommer ändras till "Godkänd".`, onConfirm: () => { approveProposal(quote); handleCloseModal(); }, confirmText: 'Ja, godkänn', confirmButtonClass: 'bg-green-500 text-white hover:bg-green-600' });
    };

    const sortedAndFilteredQuotes = useMemo(() => {
        const arkivStatus = ['betald', 'förlorad', 'arkiverad'];
        const aktivaStatus = ['utkast', 'förslag-skickat', 'godkänd', 'genomförd'];
        return [...quotes].filter(q => {
            const term = searchTerm.toLowerCase();
            const searchMatch = term === '' || q.customer?.toLowerCase().includes(term) || q.id?.toLowerCase().includes(term);
            let statusMatch = false;
            if (filter === 'alla') { statusMatch = aktivaStatus.includes(q.status); } 
            else if (filter === 'arkiv') { statusMatch = arkivStatus.includes(q.status); } 
            else { statusMatch = q.status === filter; }
            return statusMatch && searchMatch;
        });
    }, [quotes, filter, searchTerm]);

    const isModalOpen = !!selectedQuote || confirmationState.isOpen || isHubOpen;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, classes }}>
             <div className={`${classes.bg} ${classes.text} min-h-screen font-sans transition-colors duration-300`}>
                {!isLoggedIn ? ( <SimpleLoginScreen onLogin={handleLogin} /> ) : (
                    <>
                        <div className={`flex flex-col h-screen transition-all duration-300 ${isModalOpen || isSyncing ? 'filter blur-sm' : ''}`}>
                            <Header onToggleTheme={toggleTheme} theme={theme} onOpenHub={() => setIsHubOpen(true)} />
                            <MainNav activeView={activeView} setActiveView={setActiveView} />
                            <main className="flex-grow overflow-y-auto">
                                {activeView === 'quotes' && ( 
                                    <QuotesDashboard 
                                        allQuotes={quotes}
                                        displayQuotes={sortedAndFilteredQuotes}
                                        isLoading={isLoading} 
                                        fetchError={fetchError}
                                        onSelectQuote={handleSelectQuote} 
                                        onNewQuote={addNewQuote} 
                                        onFilterChange={setFilter} 
                                        onSearch={setSearchTerm} 
                                        activeFilter={filter} 
                                        searchRef={searchRef} 
                                        onStatusChange={changeQuoteStatus} 
                                    /> 
                                )}
                                {activeView === 'ai' && <AiLog />}
                                {activeView === 'analytics' && <AnalyticsPlaceholder />}
                            </main>
                        </div>

                        {isSyncing && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50"><div className="text-white text-lg font-semibold animate-pulse">Synkroniserar...</div></div>)}

                        <EditModal 
                            quote={selectedQuote} 
                            isOpen={!!selectedQuote} 
                            onClose={handleCloseModal} 
                            onSave={saveQuote} 
                            onCopy={copyAndSaveQuote} 
                            showToast={showToast} 
                            onDelete={requestDeleteConfirmation} 
                            onSendProposal={requestSendConfirmation}
                            onApproveProposal={requestApproveConfirmation}
                         />
                        <ConfirmationModal 
                            isOpen={confirmationState.isOpen} 
                            onClose={() => setConfirmationState({ isOpen: false })} 
                            onConfirm={confirmationState.onConfirm} 
                            title={confirmationState.title} 
                            message={confirmationState.message} 
                            confirmText={confirmationState.confirmText}
                            confirmButtonClass={confirmationState.confirmButtonClass}
                        />
                        <NordSymSupportHub isOpen={isHubOpen} onClose={() => setIsHubOpen(false)} />
                        <Toast toast={toast} />
                    </>
                )}
            </div>
        </ThemeContext.Provider>
    );
}

export default App;