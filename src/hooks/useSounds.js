import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

// Helper to create Noise (Brown Noise for Wind/Hum)
const createBrownNoise = (ctx) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
};

// Procedural Music Engine (Ambient Techno/Synth)
let musicCtx = null;
let musicInterval = null;

const startMusic = (volume = 0.1) => {
    if (musicCtx) return;
    try {
        musicCtx = new (window.AudioContext || window.webkitAudioContext)();
        let step = 0;

        const playStep = () => {
            if (!musicCtx) return;
            const time = musicCtx.currentTime;

            // Kick Drum (Procedural)
            if (step % 4 === 0) {
                const kick = musicCtx.createOscillator();
                const gain = musicCtx.createGain();
                kick.frequency.setValueAtTime(150, time);
                kick.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
                gain.gain.setValueAtTime(volume * 0.8, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
                kick.connect(gain);
                gain.connect(musicCtx.destination);
                kick.start(time); kick.stop(time + 0.5);
            }

            // Hi-Hat (Procedural)
            if (step % 2 !== 0) {
                const hihat = musicCtx.createBufferSource();
                const bufferSize = musicCtx.sampleRate * 0.05;
                const buffer = musicCtx.createBuffer(1, bufferSize, musicCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
                hihat.buffer = buffer;
                const gain = musicCtx.createGain();
                gain.gain.setValueAtTime(volume * 0.3, time);
                hihat.connect(gain);
                gain.connect(musicCtx.destination);
                hihat.start(time);
            }

            // Ambient Chord (Procedural)
            if (step % 16 === 0) {
                [261, 329, 392].forEach(f => {
                    const osc = musicCtx.createOscillator();
                    const gain = musicCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, time);
                    gain.gain.setValueAtTime(0, time);
                    gain.gain.linearRampToValueAtTime(volume * 0.4, time + 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + 4);
                    osc.connect(gain);
                    gain.connect(musicCtx.destination);
                    osc.start(time); osc.stop(time + 4);
                });
            }

            step = (step + 1) % 16;
        };

        musicInterval = setInterval(playStep, 250); // 120 BPM
    } catch (e) { }
};

const stopMusic = () => {
    if (musicInterval) clearInterval(musicInterval);
    if (musicCtx) { musicCtx.close(); musicCtx = null; }
};

// Flying Engine (Wind Hum)
let flyingCtx = null;
let flyingSource = null;
let flyingFilter = null;
let flyingGain = null;

const startFlyingSound = () => {
    try {
        stopFlyingSound();
        flyingCtx = new (window.AudioContext || window.webkitAudioContext)();
        flyingSource = createBrownNoise(flyingCtx);
        flyingFilter = flyingCtx.createBiquadFilter();
        flyingGain = flyingCtx.createGain();

        flyingFilter.type = 'lowpass';
        flyingFilter.frequency.setValueAtTime(400, flyingCtx.currentTime);
        flyingGain.gain.setValueAtTime(0.05, flyingCtx.currentTime);

        flyingSource.connect(flyingFilter);
        flyingFilter.connect(flyingGain);
        flyingGain.connect(flyingCtx.destination);

        flyingSource.start();
    } catch (e) { }
};

const stopFlyingSound = () => {
    try {
        if (flyingSource) { flyingSource.stop(); flyingSource = null; }
        if (flyingCtx) { flyingCtx.close(); flyingCtx = null; }
    } catch (e) { }
};

// One-shot effects
const playCrashSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = ctx.sampleRate * 1.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(100, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(5000, ctx.currentTime + 0.6);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    } catch (e) { }
};

const playCashoutSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [523, 659, 784, 1046].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.25);
        });
    } catch (e) { }
};

const playBetSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
};

export const useSounds = () => {
    const soundOn = useGameStore((s) => s.soundOn);
    const musicOn = useGameStore((s) => s.musicOn);

    useEffect(() => {
        if (musicOn) {
            startMusic();
        } else {
            stopMusic();
        }
        return () => stopMusic();
    }, [musicOn]);

    return {
        playFly: () => soundOn && startFlyingSound(),
        stopFly: () => stopFlyingSound(),
        playCrash: () => soundOn && playCrashSound(),
        playCashout: () => soundOn && playCashoutSound(),
        playBet: () => soundOn && playBetSound(),
    };
};
