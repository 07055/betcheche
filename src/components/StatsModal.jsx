import { useGameStore } from '../store/useGameStore';
import './StatsModal.css';

function StatBar({ value, max, color }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

export default function StatsModal({ history, onClose }) {
    const stats = useGameStore((s) => s.stats);
    const currency = useGameStore((s) => s.currency);
    const fmt = (n) => currency === 'KES' ? `KES ${n.toLocaleString()}` : `$${n.toFixed(2)}`;

    const winRate = stats.roundsPlayed > 0
        ? ((stats.totalWon > 0 ? 1 : 0) / stats.roundsPlayed * 100).toFixed(1)
        : '0.0';

    // Last 20 multipliers for chart
    const chartData = history.slice(0, 20).reverse();
    const chartMax = Math.max(...chartData, 2);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="stats-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📊 My Statistics</h2>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.roundsPlayed}</div>
                        <div className="stat-label">Rounds Played</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-value">{fmt(stats.totalWon)}</div>
                        <div className="stat-label">Total Won</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-value">{fmt(stats.totalWagered)}</div>
                        <div className="stat-label">Total Wagered</div>
                    </div>
                    <div className="stat-card gold">
                        <div className="stat-value">{stats.biggestMultiplier.toFixed(2)}x</div>
                        <div className="stat-label">Biggest Multiplier</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{fmt(stats.biggestWin)}</div>
                        <div className="stat-label">Biggest Win</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{winRate}%</div>
                        <div className="stat-label">Profit Rate</div>
                    </div>
                </div>

                <div className="chart-section">
                    <div className="chart-title">Last 20 Rounds</div>
                    <div className="bar-chart">
                        {chartData.map((val, i) => {
                            const isHigh = val >= 2;
                            const isUltra = val >= 10;
                            return (
                                <div key={i} className="chart-col">
                                    <div
                                        className={`chart-bar ${isUltra ? 'ultra' : isHigh ? 'high' : 'low'}`}
                                        style={{ height: `${Math.min((val / chartMax) * 100, 100)}%` }}
                                        title={`${val.toFixed(2)}x`}
                                    />
                                    <div className="chart-label">{val >= 10 ? `${val.toFixed(0)}x` : `${val.toFixed(1)}x`}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
