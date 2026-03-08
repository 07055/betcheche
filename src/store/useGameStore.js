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
            demoBalance: 3000,
            isDemoMode: true, // Start in Fun Mode by default for new users
            currency: 'KES',

            // Settings
            soundOn: true,
            animationsOn: true,
            musicOn: true,

            // Round history (last 50 results)
            roundHistory: [1.54, 2.10, 1.12, 5.40, 1.20, 1.88, 3.45, 1.01, 7.23, 2.55],

            // Personal bet history
            myBets: [],
            demoBets: [],

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
                    const savedDemoBalance = users[username].demoBalance ?? 3000;
                    set({
                        user: { username, pin },
                        isAuthenticated: true,
                        balance: savedBalance,
                        demoBalance: savedDemoBalance
                    });
                    return { success: true };
                }
                // Register new user
                users[username] = { pin, balance: DEFAULT_BALANCE, demoBalance: 3000 };
                localStorage.setItem('aviator_users', JSON.stringify(users));
                set({
                    user: { username, pin },
                    isAuthenticated: true,
                    balance: DEFAULT_BALANCE,
                    demoBalance: 3000
                });
                return { success: true };
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateBalance: (newAmount) => {
                const { user, isDemoMode } = get();
                if (isDemoMode) {
                    set({ demoBalance: newAmount });
                } else {
                    set({ balance: newAmount });
                }

                if (user) {
                    const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                    if (isDemoMode) {
                        users[user.username] = { ...users[user.username], demoBalance: newAmount };
                    } else {
                        users[user.username] = { ...users[user.username], balance: newAmount };
                    }
                    localStorage.setItem('aviator_users', JSON.stringify(users));
                }
            },

            addRoundToHistory: (crashPoint) => {
                set((state) => ({
                    roundHistory: [crashPoint, ...state.roundHistory].slice(0, 50),
                }));
            },

            addMyBet: (betRecord) => {
                const { isDemoMode } = get();
                if (isDemoMode) {
                    set((state) => ({
                        demoBets: [betRecord, ...state.demoBets].slice(0, 100),
                    }));
                } else {
                    set((state) => ({
                        myBets: [betRecord, ...state.myBets].slice(0, 100),
                    }));
                }
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
            toggleMusic: () => set((state) => ({ musicOn: !state.musicOn })),
            toggleAnimations: () => set((state) => ({ animationsOn: !state.animationsOn })),
            toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
            setCurrency: (currency) => set({ currency }),
            logout: () => {
                localStorage.removeItem('aviator_user');
                set({ user: null, isAuthenticated: false });
            },

            // Payments
            transactions: JSON.parse(localStorage.getItem('aviator_transactions') || '[]'),
            addTransaction: (tx) => set((state) => {
                const newTx = [tx, ...state.transactions].slice(0, 50);
                localStorage.setItem('aviator_transactions', JSON.stringify(newTx));
                return { transactions: newTx };
            }),
            deposit: (amount) => {
                const { user, isDemoMode, balance, demoBalance } = get();
                const newAmount = (isDemoMode ? demoBalance : balance) + amount;

                if (isDemoMode) {
                    set({ demoBalance: newAmount });
                } else {
                    set({ balance: newAmount });
                }

                if (user) {
                    const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                    const field = isDemoMode ? 'demoBalance' : 'balance';
                    users[user.username] = { ...users[user.username], [field]: newAmount };
                    localStorage.setItem('aviator_users', JSON.stringify(users));
                }
            },
            withdraw: (amount) => {
                const { user, isDemoMode, balance, demoBalance } = get();
                const current = isDemoMode ? demoBalance : balance;
                if (current < amount) return;

                const newAmount = current - amount;
                if (isDemoMode) {
                    set({ demoBalance: newAmount });
                } else {
                    set({ balance: newAmount });
                }

                if (user) {
                    const users = JSON.parse(localStorage.getItem('aviator_users') || '{}');
                    const field = isDemoMode ? 'demoBalance' : 'balance';
                    users[user.username] = { ...users[user.username], [field]: newAmount };
                    localStorage.setItem('aviator_users', JSON.stringify(users));
                }
            },
        }),
        {
            name: 'aviator-game-store',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                balance: state.balance,
                demoBalance: state.demoBalance,
                isDemoMode: state.isDemoMode,
                currency: state.currency,
                soundOn: state.soundOn,
                musicOn: state.musicOn,
                animationsOn: state.animationsOn,
                roundHistory: state.roundHistory,
                myBets: state.myBets,
                demoBets: state.demoBets,
                stats: state.stats,
            }),
        }
    )
);
