import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useAviatorLogic } from '../hooks/useAviatorLogic';
import { useSounds } from '../hooks/useSounds';
import { useGameStore } from '../store/useGameStore';
import GameCanvas from '../components/GameCanvas';
import BetPanel from '../components/BetPanel';
import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';
import StatsModal from '../components/StatsModal';
import PaymentModal from '../components/PaymentModal';
import './GamePage.css';

import PlaneIcon from '../components/PlaneIcon';

const PlaneSVG = ({ size = 70 }) => <PlaneIcon size={size} />;

export default function GamePage() {
    const navigate = useNavigate();
    const {
        multiplier, gameState, bets, nextRoundCountdown, liveBets,
        showConfetti, placeBet, cancelBet, cashOut, setBetAmount,
        setAutoCashout, registerSounds,
    } = useAviatorLogic();

    const user = useGameStore((s) => s.user);
    const balance = useGameStore((s) => s.balance);
    const currency = useGameStore((s) => s.currency);
    const roundHistory = useGameStore((s) => s.roundHistory);
    const soundOn = useGameStore((s) => s.soundOn);
    const toggleSound = useGameStore((s) => s.toggleSound);
    const toggleCurrency = useGameStore((s) => s.setCurrency);
    const logout = useGameStore((s) => s.logout);

    const sounds = useSounds();
    const [showChat, setShowChat] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    // Register sounds once using a ref to avoid re-render loops
    const soundsRef = useRef(sounds);
    soundsRef.current = sounds;
    const registeredRef = useRef(false);
    useEffect(() => {
        if (!registeredRef.current) {
            registeredRef.current = true;
            registerSounds({
                playFly: () => soundsRef.current.playFly(),
                stopFly: () => soundsRef.current.stopFly(),
                playCrash: () => soundsRef.current.playCrash(),
                playCashout: () => soundsRef.current.playCashout(),
                playBet: () => soundsRef.current.playBet(),
            });
        }
    }, [registerSounds]);

    // Window resize for confetti
    useEffect(() => {
        const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    const progress = Math.min((multiplier - 1) / 12, 1);
    const planeX = progress * 84 + 3;
    const planeY = 88 - (progress * progress * 80);

    const fmt = (n) => currency === 'KES'
        ? `KES ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : `$${n.toFixed(2)}`;

    return (
        <div className="game-page">
            {/* Confetti on cashout */}
            {showConfetti && (
                <ReactConfetti
                    width={windowSize.w} height={windowSize.h}
                    recycle={false} numberOfPieces={280}
                    colors={['#e11d48', '#f58420', '#fbbf24', '#34c552', '#60a5fa']}
                />
            )}

            {/* ── HEADER ── */}
            <header className="game-header">
                <div className="header-left">
                    <div className="logo-main">
                        <PlaneSVG size={28} />
                        <span className="aviator-logo-text" style={{ fontSize: '1.5rem', marginLeft: '8px' }}>Aviator</span>
                    </div>
                </div>

                <div className="header-center">
                    <button onClick={() => setShowStats(true)} className="nav-btn">
                        <span className="icon">📊</span> STATS
                    </button>
                    <button onClick={() => setShowChat(!showChat)} className={`nav-btn ${showChat ? 'active' : ''}`}>
                        <span className="icon">💬</span> CHAT
                    </button>
                </div>

                <div className="header-right">
                    <div className="balance-pill" onClick={() => setShowPayment(true)}>
                        <span className="balance-value">
                            {currency === 'KES' ? 'KES' : '$'}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <button className="deposit-btn">+</button>
                    </div>
                    <button className="settings-btn" alt="Menu" onClick={() => setShowStats(true)}>☰</button>
                    <div className="user-avatar-small">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </header>

            {/* ── CONTENT ── */}
            <div className="game-content">
                <Sidebar liveBets={liveBets} />

                <main className="game-main">
                    {/* History bar */}
                    <div className="history-bar">
                        <AnimatePresence>
                            {roundHistory.slice(0, 18).map((h, i) => (
                                <motion.span
                                    key={`${h}-${i}`}
                                    initial={{ opacity: 0, scale: 0.6, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className={`history-item ${h >= 10 ? 'ultra' : h >= 2 ? 'high' : 'low'}`}
                                >
                                    {h.toFixed(2)}x
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Game screen */}
                    <div className="game-screen">
                        {/* Internal Top Bar */}
                        <div className="game-screen-top">
                            <div className="provably-fair-badge">
                                <span className="dot"></span>
                                Provably Fair
                            </div>
                            <div className="game-mode-badge">FUN MODE</div>
                        </div>

                        <GameCanvas multiplier={multiplier} gameState={gameState} />

                        {/* Plane */}
                        <AnimatePresence>
                            {gameState === 'RUNNING' && (
                                <motion.div
                                    className="plane-wrapper"
                                    style={{
                                        left: `${planeX}%`,
                                        top: `${planeY}%`,
                                        zIndex: 30 // Ensure it's above canvas (1) and center multiplier (5/10)
                                    }}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <PlaneSVG size={64} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Crash explosion overlay */}
                        <AnimatePresence>
                            {gameState === 'CRASHED' && (
                                <motion.div
                                    className="crash-overlay"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.5 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <div className="crash-explosion">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="explosion-shard" style={{ '--i': i }} />
                                        ))}
                                    </div>
                                    <motion.h1
                                        className="multiplier-crashed"
                                        animate={{ scale: [1, 1.08, 1], x: [0, -6, 6, -4, 4, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {multiplier.toFixed(2)}x
                                    </motion.h1>
                                    <p className="crash-label">FLEW AWAY!</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Running multiplier */}
                        {gameState === 'RUNNING' && (
                            <div className="multiplier-center" style={{ zIndex: 15 }}>
                                <motion.h1
                                    className="multiplier-running"
                                    key={Math.floor(Number(multiplier) * 10)}
                                    animate={{ scale: [1, 1.04, 1] }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {Number(multiplier).toFixed(2)}x
                                </motion.h1>
                            </div>
                        )}

                        {/* Waiting countdown */}
                        {gameState === 'WAITING' && (
                            <div className="waiting-overlay">
                                <div className="waiting-plane">
                                    <PlaneSVG size={70} />
                                </div>
                                <p className="waiting-label">STARTING IN</p>
                                <div className="countdown-num">{nextRoundCountdown}s</div>
                                <div className="progress-track">
                                    <motion.div
                                        className="progress-fill"
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${(nextRoundCountdown / 5) * 100}%` }}
                                        transition={{ duration: 1, ease: 'linear' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bet panels */}
                    <div className="controls-grid">
                        {bets.map((bet, i) => (
                            <BetPanel
                                key={i}
                                index={i}
                                bet={bet}
                                gameState={gameState}
                                multiplier={multiplier}
                                onPlaceBet={placeBet}
                                onCancelBet={cancelBet}
                                onCashOut={cashOut}
                                onSetAmount={setBetAmount}
                                onSetAutoCashout={setAutoCashout}
                            />
                        ))}
                    </div>
                </main>
            </div>

            {/* Chat */}
            <ChatPanel isOpen={showChat} onClose={() => setShowChat(false)} />

            {/* Payment Modal */}
            {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}

            {/* Stats Modal */}
            {showStats && <StatsModal history={roundHistory} onClose={() => setShowStats(false)} />}
        </div>
    );
}
