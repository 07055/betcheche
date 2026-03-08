import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

const ROUND_WAIT_TIME = 5;

// Provably fair crash point
const generateCrashPoint = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const h = array[0] / (0xffffffff + 1);
  if (h < 0.01) return 1.00;
  return parseFloat(Math.max(1.00, (0.99 / (1 - h))).toFixed(2));
};

const NAMES = [
  'Alex***', 'Brian***', 'Caro***', 'David***', 'Elena***',
  'Felix***', 'Grace***', 'Hassan***', 'Ivy***', 'John***',
  'Kali***', 'Lena***', 'Mike***', 'Nadia***', 'Omar***',
  'Pita***', 'Quinn***', 'Rosa***', 'Sam***', 'Tina***',
  'Ugo***', 'Vera***', 'Will***', 'Xena***', 'Yara***',
  'Zak***', 'Amara***', 'Bako***', 'Chidi***', 'Deso***',
];

export const useAviatorLogic = () => {
  const { balance, updateBalance, addRoundToHistory, addMyBet, updateStats, currency } = useGameStore();

  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState('WAITING'); // WAITING, RUNNING, CRASHED
  const [nextRoundCountdown, setNextRoundCountdown] = useState(ROUND_WAIT_TIME);
  const [liveBets, setLiveBets] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dual bet panels
  const [bets, setBets] = useState([
    { amount: 100, isActive: false, isCashedOut: false, cashoutValue: null, isQueued: false, autoCashout: false, autoCashoutAt: 2.00 },
    { amount: 50, isActive: false, isCashedOut: false, cashoutValue: null, isQueued: false, autoCashout: false, autoCashoutAt: 2.00 },
  ]);

  const gameLoopRef = useRef(null);
  const startTimeRef = useRef(null);
  const crashPointRef = useRef(null);
  const multiplierRef = useRef(1.00);
  const gameStateRef = useRef('WAITING');
  const betsRef = useRef(bets);
  const balanceRef = useRef(balance);
  const soundCallbacksRef = useRef({ playFly: null, stopFly: null, playCrash: null, playCashout: null });

  // Keep refs in sync
  useEffect(() => { betsRef.current = bets; }, [bets]);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const registerSounds = useCallback((sounds) => {
    soundCallbacksRef.current = sounds;
  }, []);

  const generateLiveBets = useCallback(() => {
    const count = Math.floor(Math.random() * 8) + 8;
    const newLiveBets = Array.from({ length: count }, () => ({
      id: Math.random(),
      user: NAMES[Math.floor(Math.random() * NAMES.length)],
      bet: Math.round((Math.random() * 900 + 100)),
      multiplier: null,
      win: null,
    }));
    setLiveBets(newLiveBets);
  }, []);

  const doAutoCashout = useCallback((index, currentMultiplier) => {
    const b = betsRef.current[index];
    if (!b || !b.isActive || b.isCashedOut) return;

    const winAmount = b.amount * currentMultiplier;
    setBets(prev => {
      const next = [...prev];
      next[index] = { ...next[index], isCashedOut: true, cashoutValue: currentMultiplier, isActive: false };
      return next;
    });
    const newBal = balanceRef.current + winAmount;
    updateBalance(newBal);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    soundCallbacksRef.current.playCashout?.();

    addMyBet({
      round: new Date().toISOString(),
      wagered: b.amount,
      cashoutAt: currentMultiplier,
      won: winAmount,
      currency,
    });
  }, [updateBalance, addMyBet, currency]);

  const startNewRound = useCallback(() => {
    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    setGameState('RUNNING');
    gameStateRef.current = 'RUNNING';

    // Activate queued bets
    setBets(prev => prev.map(b =>
      b.isQueued ? { ...b, isActive: true, isQueued: false, isCashedOut: false, cashoutValue: null } : { ...b, isCashedOut: false, cashoutValue: null }
    ));

    generateLiveBets();
    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    startTimeRef.current = performance.now();
    soundCallbacksRef.current.playFly?.();

    const update = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const next = Math.pow(Math.E, 0.09 * elapsed);
      const nextMultiplier = parseFloat(next.toFixed(2));

      if (nextMultiplier >= crashPointRef.current) {
        const finalMulti = crashPointRef.current;
        setMultiplier(finalMulti);
        multiplierRef.current = finalMulti;
        setGameState('CRASHED');
        gameStateRef.current = 'CRASHED';

        addRoundToHistory(finalMulti);
        soundCallbacksRef.current.stopFly?.();
        soundCallbacksRef.current.playCrash?.();

        // Figure out stats
        let totalWagered = 0, totalWon = 0;
        setBets(prev => {
          const next2 = prev.map(b => {
            if (b.isActive && !b.isCashedOut) {
              totalWagered += b.amount;
              return { ...b, isActive: false };
            }
            if (b.isCashedOut) {
              totalWagered += b.amount;
              totalWon += b.amount * b.cashoutValue;
            }
            return b;
          });
          updateStats(totalWagered, totalWon, finalMulti);
          return next2;
        });

        cancelAnimationFrame(gameLoopRef.current);

        let timeLeft = ROUND_WAIT_TIME;
        setNextRoundCountdown(timeLeft);
        setGameState('WAITING');
        gameStateRef.current = 'WAITING';
        const interval = setInterval(() => {
          timeLeft -= 1;
          setNextRoundCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(interval);
            startNewRound();
          }
        }, 1000);
      } else {
        setMultiplier(nextMultiplier);
        multiplierRef.current = nextMultiplier;

        // Auto-cashout check
        betsRef.current.forEach((b, i) => {
          if (b.isActive && !b.isCashedOut && b.autoCashout && nextMultiplier >= b.autoCashoutAt) {
            doAutoCashout(i, nextMultiplier);
          }
        });

        // Randomly update live bets
        setLiveBets(prev => prev.map(lb => {
          if (!lb.multiplier && Math.random() > 0.994 && nextMultiplier > 1.3) {
            return { ...lb, multiplier: nextMultiplier, win: Math.round(lb.bet * nextMultiplier) };
          }
          return lb;
        }));

        gameLoopRef.current = requestAnimationFrame(update);
      }
    };

    gameLoopRef.current = requestAnimationFrame(update);
  }, [generateLiveBets, addRoundToHistory, updateStats, doAutoCashout]);

  // Only run on initial mount to start the first round
  useEffect(() => {
    const timer = setTimeout(() => startNewRound(), ROUND_WAIT_TIME * 1000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(gameLoopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cashOut = useCallback((index) => {
    const b = betsRef.current[index];
    if (gameStateRef.current === 'RUNNING' && b?.isActive && !b?.isCashedOut) {
      doAutoCashout(index, multiplierRef.current);
    }
  }, [doAutoCashout]);

  const placeBet = useCallback((index) => {
    const b = betsRef.current[index];
    const bal = balanceRef.current;
    if (bal < b.amount) return;

    if (gameStateRef.current === 'WAITING') {
      setBets(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isActive: true, isCashedOut: false, cashoutValue: null };
        return next;
      });
      updateBalance(bal - b.amount);
      soundCallbacksRef.current.playBet?.();
    } else {
      // Queue for next round
      setBets(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isQueued: true };
        return next;
      });
      updateBalance(bal - b.amount);
    }
  }, [updateBalance]);

  const cancelBet = useCallback((index) => {
    const b = betsRef.current[index];
    if (b.isQueued) {
      setBets(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isQueued: false };
        return next;
      });
      updateBalance(balanceRef.current + b.amount);
    }
  }, [updateBalance]);

  const setBetAmount = useCallback((index, amount) => {
    setBets(prev => {
      const next = [...prev];
      next[index] = { ...next[index], amount: Math.max(10, Math.round(amount)) };
      return next;
    });
  }, []);

  const setAutoCashout = useCallback((index, enabled, atValue) => {
    setBets(prev => {
      const next = [...prev];
      next[index] = { ...next[index], autoCashout: enabled, autoCashoutAt: atValue ?? next[index].autoCashoutAt };
      return next;
    });
  }, []);

  return {
    multiplier,
    gameState,
    bets,
    nextRoundCountdown,
    liveBets,
    showConfetti,
    placeBet,
    cancelBet,
    cashOut,
    setBetAmount,
    setAutoCashout,
    registerSounds,
  };
};
