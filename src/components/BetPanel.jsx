import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import './BetPanel.css';

const fmt = (n, cur) => {
    if (cur === 'KES') return `KES ${n.toLocaleString()}`;
    return `$${n.toFixed(2)}`;
};

export default function BetPanel({ index, bet, gameState, multiplier, onPlaceBet, onCancelBet, onCashOut, onSetAmount, onSetAutoCashout }) {
    const balance = useGameStore((s) => s.balance);
    const demoBalance = useGameStore((s) => s.demoBalance);
    const isDemoMode = useGameStore((s) => s.isDemoMode);
    const currency = useGameStore((s) => s.currency);

    const [activeTab, setActiveTab] = useState('bet'); // 'bet' or 'auto'
    const [localAuto, setLocalAuto] = useState(bet.autoCashoutAt);

    const currentBalance = isDemoMode ? demoBalance : balance;
    const canBet = (gameState === 'WAITING' || gameState === 'RUNNING' || gameState === 'CRASHED') && !bet.isActive && !bet.isQueued && currentBalance >= bet.amount;
    const isInGame = bet.isActive && !bet.isCashedOut;
    const currentWin = bet.amount * multiplier;

    const PRESETS = currency === 'KES' ? [2, 10, 50, 100] : [0.1, 1, 5, 10];

    // Pulse animation value
    const [pulse, setPulse] = useState(false);
    useEffect(() => {
        if (isInGame) {
            const t = setInterval(() => setPulse(p => !p), 600);
            return () => clearInterval(t);
        }
        setPulse(false);
    }, [isInGame]);

    return (
        <div className={`bet-panel ${isInGame ? 'active-panel' : ''} ${bet.isQueued ? 'queued-panel' : ''}`}>
            <div className="panel-header-tabs">
                <div className="tabs-group">
                    <button
                        className={`tab-item ${activeTab === 'bet' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bet')}
                    >
                        Bet
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'auto' ? 'active' : ''}`}
                        onClick={() => setActiveTab('auto')}
                    >
                        Auto
                    </button>
                </div>
            </div>

            {/* Amount controls and Bet buttons */}
            <div className="bet-main-row">
                <div className="bet-amount-col">
                    <div className="bet-input-group">
                        <button onClick={() => !bet.isActive && !bet.isQueued && onSetAmount(index, bet.amount - (currency === 'KES' ? 10 : 1))} className="btn-circle" disabled={bet.isActive || bet.isQueued}>−</button>
                        <input
                            type="number"
                            value={bet.amount}
                            onChange={e => !bet.isActive && !bet.isQueued && onSetAmount(index, Number(e.target.value))}
                            className="bet-input"
                            readOnly={bet.isActive || bet.isQueued}
                        />
                        <button onClick={() => !bet.isActive && !bet.isQueued && onSetAmount(index, bet.amount + (currency === 'KES' ? 10 : 1))} className="btn-circle" disabled={bet.isActive || bet.isQueued}>+</button>
                    </div>
                    <div className="bet-presets">
                        {PRESETS.map(amt => (
                            <button key={amt} onClick={() => !bet.isActive && !bet.isQueued && onSetAmount(index, amt)} className="preset-btn" disabled={bet.isActive || bet.isQueued}>{amt}</button>
                        ))}
                    </div>
                </div>

                <div className="bet-action-col">
                    {bet.isCashedOut ? (
                        <div className="cashed-out-status">
                            <span className="win-mult">{bet.cashoutValue.toFixed(2)}x</span>
                            <span className="win-value">{fmt(bet.amount * bet.cashoutValue, currency)}</span>
                        </div>
                    ) : isInGame ? (
                        <button onClick={() => onCashOut(index)} className="cashout-btn" disabled={gameState !== 'RUNNING'}>
                            <span className="cashout-label">CASH OUT</span>
                            <span className="current-win">{fmt(currentWin, currency)}</span>
                        </button>
                    ) : bet.isQueued ? (
                        <button onClick={() => onCancelBet(index)} className="cancel-btn">
                            CANCEL
                        </button>
                    ) : (
                        <button
                            onClick={() => onPlaceBet(index)}
                            disabled={!canBet}
                            className="bet-btn"
                        >
                            <span className="btn-label">BET</span>
                            <span className="btn-val">{fmt(bet.amount, currency)}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Auto-cashout row (only in auto tab) */}
            {activeTab === 'auto' && (
                <div className="auto-settings-row">
                    <div className="auto-cashout-toggle">
                        <label className="auto-label">
                            <div className={`toggle-switch ${bet.autoCashout ? 'on' : ''}`} onClick={() => onSetAutoCashout(index, !bet.autoCashout, localAuto)}>
                                <div className="toggle-thumb" />
                            </div>
                            <span>Auto Cash Out</span>
                        </label>
                    </div>
                    <div className="auto-cashout-input">
                        <input
                            type="number"
                            value={localAuto}
                            min="1.1"
                            max="1000"
                            step="0.1"
                            onChange={e => { setLocalAuto(parseFloat(e.target.value)); onSetAutoCashout(index, true, parseFloat(e.target.value)); }}
                            className="auto-input"
                        />
                        <span className="mult-x">x</span>
                    </div>
                </div>
            )}
        </div>
    );
}
