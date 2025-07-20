import React, { useState, useContext } from 'react';
import { ThemeContext, themes, focusClasses } from '../../contexts/ThemeContext';
import GuldkantLogo from '../common/GuldkantLogo.jsx';
import { Input } from '../common/FormComponents.jsx';

const SimpleLoginScreen = ({ onLogin }) => {
    const { classes } = useContext(ThemeContext);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.toLowerCase() === 'guldbyxor') {
            onLogin();
        } else {
            setError('Felaktig fras. Försök igen.');
            setPassword('');
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-screen ${classes.bg}`}>
            <style>{`
                @keyframes fadeInScale { 
                    from { opacity: 0; transform: scale(0.95); } 
                    to { opacity: 1; transform: scale(1); } 
                }
                .animate-pulse-glow { 
                    animation: pulseGlow 2.5s infinite; 
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 0 0 ${themes.light.accent}77; } 
                    50% { box-shadow: 0 0 12px 6px #00000000, 0 0 8px 3px ${themes.light.accent}77; } 
                }
                .animate-fade-in-scale { 
                    animation: fadeInScale 0.7s ease-out forwards; 
                }
            `}</style>
            <div className={`p-10 rounded-xl shadow-2xl w-full max-w-md ${classes.cardBg} animate-fade-in-scale`}>
                <div className="flex justify-center mb-8">
                    <GuldkantLogo className={classes.text} size="h-24" />
                </div>
                <h1 className="text-3xl font-bold text-center mb-2">Välkommen till Guldkant Portalen</h1>
                <p className={`${classes.textSecondary} text-center mb-8`}>Vänligen ange din fras för att fortsätta.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        type="password"
                        label="Hemlig fras"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••••••"
                        error={error}
                    />
                    <button type="submit" className={`w-full ${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-5 py-3 rounded-lg font-semibold transition-colors text-lg animate-pulse-glow ${focusClasses}`}>
                        Logga in
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SimpleLoginScreen;