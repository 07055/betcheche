import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_BALANCE = 1000;

export const useGameStore = create(
    persist(
        (set, get) => ({
            // User
            user: null,
            isAuthenticated: false,

            // Balance & Currency
            balance: DEFAULT_BALANCE,
            currency: 'KES',

            // Settings
            soundOn: true,
            animationsOn: true,

            // Round history (last 50 results)
            roundHistory: [1.54, 2.10, 1.12, 5.40, 1.20, 1.88, 3.45, 1.01, 7.23, 2.55],

            // Personal bet history
            myBets: [],

            // Session stats
            stats: {
                roundsPlayed: 0,
                totalWagered: 0,
                totalWon: 0,
                biggestWin: 0,
                biggestMultiplier: 0,
            },

            // Actions
            login: (username, pin) => {
                const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                if (users[username]) {
                    if (users[username].pin !== pin) return { success: false, error: 'Wrong PIN' };
                    const savedBalance = users[username].balance ?? DEFAULT_BALANCE;
                    set({ user: { username, pin }, isAuthenticated: true, balance: savedBalance });
                    return { success: true };
                }
                // Register new user
                users[username] = { pin, balance: DEFAULT_BALANCE };
                localStorage.setItem('aviator_users', JSON.stringify(users));
                set({ user: { username, pin }, isAuthenticated: true, balance: DEFAULT_BALANCE });
                return { success: true };
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateBalance: (newBalance) => {
                const { user } = get();
                set({ balance: newBalance });
                if (user) {
                    const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                    users[user.username] = { ...users[user.username], balance: newBalance };
                    localStorage.setItem('aviator_users', JSON.stringify(users));
                }
            },

            addRoundToHistory: (crashPoint) => {
                set((state) => ({
                    roundHistory: [crashPoint, ...state.roundHistory].slice(0, 50),
                }));
            },

            addMyBet: (betRecord) => {
                set((state) => ({
                    myBets: [betRecord, ...state.myBets].slice(0, 100),
                }));
            },

            updateStats: (wagered, won, multiplier) => {
                set((state) => ({
                    stats: {
                        roundsPlayed: state.stats.roundsPlayed + 1,
                        totalWagered: state.stats.totalWagered + wagered,
                        totalWon: state.stats.totalWon + won,
                        biggestWin: Math.max(state.stats.biggestWin, won),
                        biggestMultiplier: Math.max(state.stats.biggestMultiplier, multiplier),
                    },
                }));
            },

            toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
            toggleAnimations: () => set((state) => ({ animationsOn: !state.animationsOn })),
            setCurrency: (currency) => set({ currency }),
            logout: () => {
                localStorage.removeItem('aviator_user');
                set({ user: null, isAuthenticated: false }); // Keep isAuthenticated: false for consistency
            },

            // Payments
            transactions: JSON.parse(localStorage.getItem('aviator_transactions') || '[]'),
            addTransaction: (tx) => set((state) => {
                const newTx = [tx, ...state.transactions].slice(0, 50);
                localStorage.setItem('aviator_transactions', JSON.stringify(newTx));
                return { transactions: newTx };
            }),
            deposit: (amount) => set((state) => {
                const newBalance = state.balance + amount;
                // Update user's balance in localStorage if logged in
                const { user } = get();
                if (user) {
                    const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                    users[user.username] = { ...users[user.username], balance: newBalance };
                    localStorage.setItem('aviator_users', JSON.stringify(users));
                }
                return { balance: newBalance };
            }),
            withdraw: (amount) => set((state) => {
                if (state.balance < amount) return {};
                const newBalance = state.balance - amount;
                // Update user's balance in localStorage if logged in
                const { user } = get();
                if (user) {
                    const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                    users[user.username] = { ...users[user.username], balance: newBalance };
                    localStorage.setItem('aviator_users', JSON.stringify(users));
                }
                return { balance: newBalance };
            }),
        }),
        {
            name: 'aviator-game-store',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                balance: state.balance,
                currency: state.currency,
                soundOn: state.soundOn,
                roundHistory: state.roundHistory,
                myBets: state.myBets,
                stats: state.stats,
            }),
        }
    )
);
