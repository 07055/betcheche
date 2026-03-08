import React from 'react';

export default function PlaneIcon({ size = 80, className = "" }) {
    return (
        <div className={`plane-container ${className}`} style={{ width: size, height: size * 0.6 }}>
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Propeller Blur Animation */}
                <g className="propeller-blur">
                    <ellipse cx="92" cy="30" rx="3" ry="25" fill="rgba(255,255,255,0.15)" />
                    <circle cx="92" cy="30" r="4" fill="#333" />
                </g>

                {/* Animated Propeller Blade */}
                <rect className="propeller-blade" x="91" y="5" width="2" height="50" rx="1" fill="#111">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 92 30"
                        to="360 92 30"
                        dur="0.05s"
                        repeatCount="indefinite"
                    />
                </rect>

                {/* Main Body (Fuselage) */}
                <path d="M10 25C10 20 20 15 40 15C75 15 90 22 92 30C90 38 75 45 40 45C20 45 10 40 10 35L5 38L5 22L10 25Z" fill="url(#planeGradient)" />
                <path d="M10 25C10 20 20 15 40 15C75 15 90 22 92 30L40 30L10 25Z" fill="rgba(255,255,255,0.1)" />

                {/* Cockpit */}
                <path d="M55 22C55 18 65 17 75 18C80 20 82 25 80 28C70 28 55 26 55 22Z" fill="#22d3ee" fillOpacity="0.8" />
                <path d="M58 21L72 19" stroke="white" strokeWidth="0.5" strokeLinecap="round" />

                {/* Wings - Top */}
                <path d="M35 22L75 12L78 16L38 26L35 22Z" fill="#be123c" />
                <path d="M35 22L75 12L76 13L36 23L35 22Z" fill="rgba(255,255,255,0.3)" />

                {/* Wings - Bottom */}
                <path d="M35 38L75 48L78 44L38 34L35 38Z" fill="#be123c" />

                {/* Tail Fin */}
                <path d="M10 25L5 10L15 15L10 25Z" fill="#e11d48" />
                <path d="M10 35L5 50L15 45L10 35Z" fill="#e11d48" />

                {/* Engine Cowling Detail */}
                <circle cx="88" cy="30" r="8" fill="#991b1b" />
                <circle cx="88" cy="30" r="5" fill="#450a0a" />

                <defs>
                    <linearGradient id="planeGradient" x1="5" y1="30" x2="92" y2="30" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#9f1239" />
                        <stop offset="0.5" stopColor="#e11d48" />
                        <stop offset="1" stopColor="#fb7185" />
                    </linearGradient>
                </defs>
            </svg>

            <style jsx>{`
                .plane-container {
                    filter: drop-shadow(0 0 12px rgba(225, 29, 72, 0.6));
                }
                .propeller-blade {
                    transform-box: fill-box;
                    transform-origin: center;
                }
            `}</style>
        </div>
    );
}
