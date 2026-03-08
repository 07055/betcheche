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
            <div className="sidebar-footer">
                <div className="footer-badges">
                    <div className="badge provably-fair">
                        <span className="dot"></span>
                        Provably Fair
                    </div>
                </div>
                <div className="footer-partners">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/UFC_Logo.svg/1024px-UFC_Logo.svg.png" alt="UFC" className="partner-logo" />
                    <div className="powered-by">
                        <span>Powered by</span>
                        <div className="spribe-logo">
                            <svg viewBox="0 0 100 24" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 4 L14 4 L14 20 L10 20 Z" fill="#e11d48" />
                                <path d="M16 4 H26 V8 H16 V12 H24 V16 H16 V20 H10 V4 Z" fill="white" opacity="0.8" />
                                <text x="18" y="17" fill="white" fontSize="14" fontWeight="900" style={{ letterSpacing: '1px', fontFamily: 'Inter, sans-serif' }}>SPRIBE</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
