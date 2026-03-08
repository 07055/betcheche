import { useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { useGameStore } from '../store/useGameStore';

// Generate simple tones using AudioContext as fallback (no files needed)
const createTone = (freq, duration, type = 'sine', volume = 0.3) => {
    return {
        play: () => {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
                gainNode.gain.setValueAtTime(volume, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + duration);
            } catch (e) {
                // Silently fail if audio not supported
            }
        },
        stop: () => { },
        loop: false,
    };
};

let flyingCtx = null;
let flyingOscillator = null;
let flyingGain = null;

const startFlyingSound = () => {
    try {
        stopFlyingSound();
        flyingCtx = new (window.AudioContext || window.webkitAudioContext)();
        flyingOscillator = flyingCtx.createOscillator();
        flyingGain = flyingCtx.createGain();
        flyingOscillator.connect(flyingGain);
        flyingGain.connect(flyingCtx.destination);
        flyingOscillator.type = 'sawtooth';
        flyingOscillator.frequency.setValueAtTime(180, flyingCtx.currentTime);
        flyingGain.gain.setValueAtTime(0.04, flyingCtx.currentTime);
        flyingOscillator.start();
    } catch (e) { }
};

const stopFlyingSound = () => {
    try {
        if (flyingOscillator) { flyingOscillator.stop(); flyingOscillator = null; }
        if (flyingCtx) { flyingCtx.close(); flyingCtx = null; }
    } catch (e) { }
};

const playCrashSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // High-pass/Band-pass Noise (Whoosh)
        const bufferSize = ctx.sampleRate * 0.8;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.5);
        filter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start();
    } catch (e) { }
};

const playCashoutSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784, 1046]; // C E G C arpeggio
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
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
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch (e) { }
};

export const useSounds = () => {
    const soundOn = useGameStore((s) => s.soundOn);

    return {
        playFly: () => soundOn && startFlyingSound(),
        stopFly: () => stopFlyingSound(),
        playCrash: () => soundOn && playCrashSound(),
        playCashout: () => soundOn && playCashoutSound(),
        playBet: () => soundOn && playBetSound(),
    };
};
