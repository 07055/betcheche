import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import './BetPanel.css';

const fmt = (n, cur) => {
    if (cur === 'KES') return `KES ${n.toLocaleString()}`;
    return `$${n.toFixed(2)}`;
};

export default function BetPanel({ index, bet, gameState, multiplier, onPlaceBet, onCancelBet, onCashOut, onSetAmount, onSetAutoCashout }) {
    const currency = useGameStore((s) => s.currency);
    const balance = useGameStore((s) => s.balance);
    const [localAuto, setLocalAuto] = useState(bet.autoCashoutAt);

    const canBet = (gameState === 'WAITING' || gameState === 'RUNNING' || gameState === 'CRASHED') && !bet.isActive && !bet.isQueued && balance >= bet.amount;
    const isInGame = bet.isActive && !bet.isCashedOut;
    const currentWin = bet.amount * multiplier;

    const PRESETS = currency === 'KES' ? [50, 100, 500, 1000] : [1, 5, 10, 50];

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
            <div className="panel-header">
                <span className="panel-label">BET {index + 1}</span>
                {isInGame && <span className="live-badge pulse">LIVE</span>}
                {bet.isQueued && <span className="queued-badge">NEXT ROUND</span>}
                {bet.isCashedOut && <span className="won-badge">✓ WON</span>}
            </div>

            {/* Amount controls */}
            <div className="bet-controls-row">
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

            {/* Quick multiplier buttons */}
            {!bet.isActive && !bet.isQueued && (
                <div className="quick-row">
                    <button onClick={() => onSetAmount(index, Math.max(10, Math.round(bet.amount / 2)))} className="quick-btn">÷2</button>
                    <button onClick={() => onSetAmount(index, bet.amount * 2)} className="quick-btn">×2</button>
                    <button onClick={() => onSetAmount(index, Math.floor(balance * 0.5))} className="quick-btn">½ Max</button>
                    <button onClick={() => onSetAmount(index, Math.floor(balance))} className="quick-btn">Max</button>
                </div>
            )}

            {/* Auto-cashout toggle */}
            <div className="auto-cashout-row">
                <label className="auto-label">
                    <div className={`toggle-switch ${bet.autoCashout ? 'on' : ''}`} onClick={() => onSetAutoCashout(index, !bet.autoCashout, localAuto)}>
                        <div className="toggle-thumb" />
                    </div>
                    <span>Auto Cash Out</span>
                </label>
                {bet.autoCashout && (
                    <div className="auto-input-group">
                        <span>@</span>
                        <input
                            type="number"
                            value={localAuto}
                            min="1.1"
                            max="1000"
                            step="0.1"
                            onChange={e => { setLocalAuto(parseFloat(e.target.value)); onSetAutoCashout(index, true, parseFloat(e.target.value)); }}
                            className="auto-input"
                        />
                        <span>x</span>
                    </div>
                )}
            </div>

            {/* Action button */}
            {bet.isCashedOut ? (
                <div className="cashed-out-status">
                    <span className="won-icon">🎉</span>
                    <span className="win-value">{fmt(bet.amount * bet.cashoutValue, currency)}</span>
                    <span className="win-mult">at {bet.cashoutValue.toFixed(2)}x</span>
                </div>
            ) : isInGame ? (
                <button onClick={() => onCashOut(index)} className="cashout-btn" disabled={gameState !== 'RUNNING'}>
                    <span className="cashout-label">CASH OUT</span>
                    <span className="current-win">{fmt(currentWin, currency)}</span>
                </button>
            ) : bet.isQueued ? (
                <button onClick={() => onCancelBet(index)} className="cancel-btn">
                    Cancel Next Round
                </button>
            ) : (
                <button
                    onClick={() => onPlaceBet(index)}
                    disabled={!canBet}
                    className="bet-btn"
                >
                    {gameState === 'WAITING' ? `BET ${fmt(bet.amount, currency)}` : `BET NEXT ROUND`}
                </button>
            )}
        </div>
    );
}
