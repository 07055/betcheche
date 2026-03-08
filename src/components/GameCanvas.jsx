import { useEffect, useRef } from 'react';

// Starfield + flight curve + particle trail canvas
export default function GameCanvas({ multiplier, gameState }) {
    const canvasRef = useRef(null);
    const starsRef = useRef([]);
    const particlesRef = useRef([]);
    const animRef = useRef(null);

    // Initialize stars once
    useEffect(() => {
        starsRef.current = Array.from({ length: 120 }, () => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 1.8 + 0.3,
            speed: Math.random() * 0.0003 + 0.0001,
            opacity: Math.random() * 0.7 + 0.2,
            twinkle: Math.random() * Math.PI * 2,
        }));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let lastTime = 0;

        const render = (timestamp) => {
            const dt = timestamp - lastTime;
            lastTime = timestamp;

            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            // Background gradient (shifts redder as multiplier grows)
            const mVal = Number(multiplier || 1);
            const redIntensity = Math.min((mVal - 1) / 15, 1);
            const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.8);

            // Higher base brightness for "stop 0" (45, 12, 50) and "stop 1" (#080808)
            bg.addColorStop(0, `rgba(${Math.round(45 + redIntensity * 70)}, ${Math.round(12 + redIntensity * 5)}, ${Math.round(50 + redIntensity * 20)}, 1)`);
            bg.addColorStop(1, '#080808');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Sunburst rays
            const rayCount = 40;
            const rayAlpha = 0.12 + (Math.sin(timestamp * 0.001) * 0.03);
            ctx.save();
            ctx.translate(W * 0.5, H * 0.5);
            ctx.rotate(timestamp * 0.00004); // Very slow spin
            for (let i = 0; i < rayCount; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const angle1 = (i / rayCount) * Math.PI * 2;
                const angle2 = ((i + 0.6) / rayCount) * Math.PI * 2;
                ctx.lineTo(Math.cos(angle1) * W, Math.sin(angle1) * W);
                ctx.lineTo(Math.cos(angle2) * W, Math.sin(angle2) * W);
                ctx.closePath();
                ctx.fillStyle = i % 2 === 0 ? `rgba(225,29,72,${rayAlpha})` : 'transparent';
                ctx.fill();
            }
            ctx.restore();

            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.015)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 80) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += 80) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }

            // Twinkling stars
            const t = timestamp / 1000;
            starsRef.current.forEach(star => {
                star.twinkle += dt * 0.002;
                const alpha = star.opacity * (0.5 + 0.3 * Math.sin(star.twinkle));
                ctx.beginPath();
                ctx.arc(star.x * W, star.y * H, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fill();
            });

            if (gameState !== 'RUNNING' && gameState !== 'CRASHED') {
                animRef.current = requestAnimationFrame(render);
                return;
            }

            // Build curve points
            const points = [];
            const steps = 100;
            const progress = Math.min((multiplier - 1) / 12, 1);

            // Always add start point (3% x, 88% y)
            points.push({ x: W * 0.03, y: H * 0.88 });

            if (progress > 0) {
                for (let i = 1; i <= Math.floor(steps * progress); i++) {
                    const t = i / steps;
                    const p = t * (multiplier - 1) / (multiplier - 1 || 1); // logic check
                    const px = (t * progress) * 84 + 3;
                    const py = 88 - ((t * progress) * (t * progress) * 80);
                    points.push({ x: (px / 100) * W, y: (py / 100) * H });
                }
            }

            // Always ensure the current tip is included
            const curX = progress * 84 + 3;
            const curY = 88 - (progress * progress * 80);
            points.push({ x: (curX / 100) * W, y: (curY / 100) * H });

            if (points.length >= 2) {
                const lastPt = points[points.length - 1];

                // Spawn trail particles at plane position
                if (gameState === 'RUNNING' && Math.random() > 0.4) {
                    particlesRef.current.push({
                        x: lastPt.x - 10,
                        y: lastPt.y + 5,
                        vx: -Math.random() * 1.5 - 0.5,
                        vy: Math.random() * 1 - 0.5,
                        life: 1,
                        size: Math.random() * 4 + 2,
                    });
                }

                // Update + draw particles
                particlesRef.current = particlesRef.current.filter(p => p.life > 0);
                particlesRef.current.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 0.03;
                    p.size *= 0.97;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,160,100,${p.life * 0.4})`;
                    ctx.fill();
                });

                // Fill under curve
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.lineTo(lastPt.x, H);
                ctx.lineTo(points[0].x, H);
                ctx.closePath();
                const grad = ctx.createLinearGradient(0, 0, 0, H);
                grad.addColorStop(0, 'rgba(225,29,72,0.28)');
                grad.addColorStop(1, 'rgba(225,29,72,0.02)');
                ctx.fillStyle = grad;
                ctx.fill();

                // Stroke curve
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.strokeStyle = '#e11d48';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'rgba(225,29,72,0.9)';
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Glowing dot at tip
                const dotGrad = ctx.createRadialGradient(lastPt.x, lastPt.y, 0, lastPt.x, lastPt.y, 10);
                dotGrad.addColorStop(0, 'rgba(255,80,100,1)');
                dotGrad.addColorStop(1, 'rgba(255,80,100,0)');
                ctx.beginPath();
                ctx.arc(lastPt.x, lastPt.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = dotGrad;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }

            animRef.current = requestAnimationFrame(render);
        };

        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [multiplier, gameState]);

    return (
        <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
    );
}
