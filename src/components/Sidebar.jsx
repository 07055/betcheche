import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import './Sidebar.css';

const fmt = (n, cur) => cur === 'KES' ? `K${n.toLocaleString()}` : `$${n.toFixed(2)}`;

export default function Sidebar({ liveBets }) {
    const [activeTab, setActiveTab] = useState('all');
    const myBets = useGameStore((s) => s.myBets);
    const currency = useGameStore((s) => s.currency);

    // Top winners = all bets that have a multiplier, sorted by win amount
    const topBets = [...liveBets]
        .filter(b => b.multiplier)
        .sort((a, b) => b.win - a.win)
        .slice(0, 15);

    return (
        <aside className="sidebar">
            <div className="sidebar-tabs">
                {['all', 'my', 'top'].map(tab => (
                    <button
                        key={tab}
                        className={`sidebar-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'all' ? 'All Bets' : tab === 'my' ? 'My Bets' : '🏆 Top'}
                    </button>
                ))}
            </div>

            <div className="sidebar-col-header">
                <span>Player</span>
                <span>Bet</span>
                <span>Payout</span>
            </div>

            <div className="sidebar-list">
                {activeTab === 'all' && liveBets.map((bet, i) => (
                    <div key={bet.id ?? i} className={`bet-row ${bet.multiplier ? 'won' : ''}`}>
                        <span className="player-cell">
                            <span className="avatar" style={{ background: `hsl(${(bet.user.charCodeAt(0) * 37) % 360}, 60%, 45%)` }}>
                                {bet.user[0]}
                            </span>
                            <span className="player-name">{bet.user}</span>
                        </span>
                        <span className="bet-cell">{fmt(bet.bet, currency)}</span>
                        <span className="payout-cell">
                            {bet.multiplier
                                ? <span className="payout-pill">{bet.multiplier.toFixed(2)}x</span>
                                : <span className="pending-dot" />}
                        </span>
                    </div>
                ))}

                {activeTab === 'my' && (
                    myBets.length === 0
                        ? <div className="empty-state">No bets yet this session</div>
                        : myBets.map((b, i) => (
                            <div key={i} className="bet-row won">
                                <span className="player-cell">
                                    <span className="avatar" style={{ background: '#e11d48' }}>M</span>
                                    <span className="player-name">{new Date(b.round).toLocaleTimeString()}</span>
                                </span>
                                <span className="bet-cell">{fmt(b.wagered, currency)}</span>
                                <span className="payout-cell">
                                    <span className="payout-pill">{b.cashoutAt.toFixed(2)}x</span>
                                </span>
                            </div>
                        ))
                )}

                {activeTab === 'top' && (
                    topBets.length === 0
                        ? <div className="empty-state">No cashouts yet</div>
                        : topBets.map((bet, i) => (
                            <div key={i} className="bet-row won" style={{ '--rank': i }}>
                                <span className="player-cell">
                                    <span className="rank-badge">#{i + 1}</span>
                                    <span className="player-name">{bet.user}</span>
                                </span>
                                <span className="bet-cell">{fmt(bet.bet, currency)}</span>
                                <span className="payout-cell">
                                    <span className="payout-pill gold">{bet.multiplier.toFixed(2)}x</span>
                                </span>
                            </div>
                        ))
                )}
            </div>
        </aside>
    );
}
