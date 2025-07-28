import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { Input, Textarea } from '../common/FormComponents.jsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.jsx';
import XIcon from '../icons/XIcon.jsx';

const NordSymSupportHub = ({ isOpen, onClose }) => {
    const { classes } = useContext(ThemeContext);
    const [modalView, setModalView] = useState('welcome'); // 'welcome' or 'form'
    const [formState, setFormState] = useState({ submitting: false, succeeded: false, error: null });

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setFormState(prev => ({ ...prev, submitting: true, error: null }));
        const formData = new FormData(event.target);

        try {
            const response = await fetch("https://formspree.io/f/xeokylww", {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                setFormState(prev => ({ ...prev, submitting: false, succeeded: true }));
                event.target.reset();
            } else {
                const data = await response.json();
                const errorMessage = data.errors ? data.errors.map(e => e.message).join(', ') : "Ett fel uppstod.";
                setFormState(prev => ({ ...prev, submitting: false, error: errorMessage }));
            }
        } catch (error) {
            setFormState(prev => ({ ...prev, submitting: false, error: "Kunde inte skicka meddelandet. Kontrollera din anslutning." }));
        }
    };

    // Reset and close modal after success
    useEffect(() => {
        if (formState.succeeded) {
            const timer = setTimeout(() => {
                onClose();
                // Second timeout to reset state after the closing animation
                setTimeout(() => {
                    setModalView('welcome');
                    setFormState({ submitting: false, succeeded: false, error: null });
                }, 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [formState.succeeded, onClose]);

    // Reset state when modal is closed externally
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setModalView('welcome');
                setFormState({ submitting: false, succeeded: false, error: null });
            }, 300); // Delay to allow closing animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const WelcomeView = () => (
        <>
            <div className="text-center">
                <h3 className={`text-2xl font-bold ${classes.accent}`}>Support & Information</h3>
                <p className={`${classes.textSecondary} mt-2`}>Portalen drivs av NordSym AB</p>
            </div>
            <div className={`mt-6 p-4 rounded-lg ${classes.inputBg} border ${classes.border}`}>
                <h4 className="font-semibold">Framtiden, Förenklad.</h4>
                <p className={`mt-2 text-sm ${classes.textSecondary}`}>
                    Vi är arkitekterna bakom intelligenta ekosystem som detta. Vårt uppdrag är att lösa komplexa problem med klarhet, precision och en orubblig tro på teknologins potential.
                </p>
                <div className="mt-4 text-sm">
                    <p><strong>Kontakt:</strong> gustav@nordsym.com</p>
                    <p><strong>Telefon:</strong> 070-5292583</p>
                </div>
            </div>
            <div className="mt-6">
                <button onClick={() => setModalView('form')} className={`w-full ${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-5 py-2.5 rounded-lg font-semibold transition-colors shadow ${focusClasses}`}>
                    Lämna Feedback eller Kontakta Support
                </button>
            </div>
        </>
    );

    const FormView = () => {
        if (formState.succeeded) {
            return (
                <div className="text-center p-8">
                    <CheckCircleIcon className={`w-16 h-16 mx-auto text-green-500 mb-4`} />
                    <h3 className={`text-2xl font-bold ${classes.accent}`}>Tack för ditt meddelande!</h3>
                    <p className={`${classes.textSecondary} mt-2`}>Vi har tagit emot din feedback och återkommer snart.</p>
                </div>
            );
        }
        return (
            <>
                <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold ${classes.accent}`}>Feedback & Support</h3>
                    <p className={`${classes.textSecondary} mt-2`}>Har du en fråga, ett problem eller en idé? Låt oss veta!</p>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <Input label="Ditt Namn" id="name" name="name" type="text" required />
                    <Input label="Din E-post" id="email" name="email" type="email" required />
                    <Input label="Ämne" id="subject" name="subject" type="text" required />
                    <Textarea label="Meddelande" id="message" name="message" required />
                    {formState.error && <p className="text-red-500 text-sm">{formState.error}</p>}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setModalView('welcome')} className={`${classes.buttonSecondaryBg} ${classes.buttonSecondaryText} ${classes.buttonSecondaryHover} px-5 py-2.5 rounded-lg font-semibold transition-colors ${focusClasses}`}>
                            Tillbaka
                        </button>
                        <button type="submit" disabled={formState.submitting} className={`w-40 ${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-5 py-2.5 rounded-lg font-semibold transition-colors shadow disabled:opacity-50 disabled:cursor-wait ${focusClasses}`}>
                            {formState.submitting ? 'Skickar...' : 'Skicka'}
                        </button>
                    </div>
                </form>
            </>
        );
    }
    
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-fast ${classes.modalOverlay}`}>
            <div onClick={e => e.stopPropagation()} className={`${classes.cardBg} w-full max-w-2xl rounded-xl shadow-2xl flex flex-col relative`}>
                <button onClick={onClose} className={`absolute top-3 right-3 p-2 rounded-full hover:bg-red-500/10 ${focusClasses}`}>
                    <XIcon className="w-6 h-6 hover:text-red-500" />
                </button>
                <div className="p-8">
                    {modalView === 'welcome' ? <WelcomeView /> : <FormView />}
                </div>
            </div>
        </div>
    );
};

export default NordSymSupportHub;