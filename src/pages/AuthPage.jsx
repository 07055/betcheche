import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import './AuthPage.css';

export default function AuthPage() {
    const [tab, setTab] = useState('login');
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useGameStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim()) return setError('Enter a username');
        if (pin.length < 4) return setError('PIN must be at least 4 digits');
        if (tab === 'register' && pin !== confirm) return setError('PINs do not match');

        setLoading(true);
        setTimeout(() => {
            const result = login(username.trim(), pin);
            setLoading(false);
            if (result.success) navigate('/game');
            else setError(result.error);
        }, 600);
    };

    return (
        <div className="auth-page">
            {/* Animated starfield */}
            <div className="auth-stars">
                {Array.from({ length: 80 }).map((_, i) => (
                    <div key={i} className="auth-star" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 4}s`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        width: `${1 + Math.random() * 2}px`,
                        height: `${1 + Math.random() * 2}px`,
                    }} />
                ))}
            </div>

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <svg viewBox="0 0 60 40" width="52" height="35">
                        <path d="M2,20 L55,2 L45,20 L55,38 Z" fill="#e11d48" />
                        <path d="M2,20 L45,20 L40,32 Z" fill="#b91c1c" />
                        <path d="M45,20 L55,2 L48,20 Z" fill="rgba(255,255,255,0.2)" />
                    </svg>
                    <h1 className="auth-title">AVIATOR</h1>
                    <p className="auth-subtitle">The Crash Game</p>
                </div>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
                        Sign In
                    </button>
                    <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
                        Register
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label>PIN (4+ digits)</label>
                        <input
                            type="password"
                            placeholder="••••"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            inputMode="numeric"
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    {tab === 'register' && (
                        <div className="auth-field">
                            <label>Confirm PIN</label>
                            <input
                                type="password"
                                placeholder="••••"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                inputMode="numeric"
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : tab === 'login' ? 'Play Now' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-note">
                    {tab === 'login'
                        ? "New here? Register to get KES 1,000 free balance!"
                        : "Play responsibly. For entertainment only."}
                </p>
            </div>
        </div>
    );
}
