import React from 'react';

export default function PlaneIcon({ size = 80, className = "" }) {
    return (
        <div className={`plane-container ${className}`} style={{ width: size, height: size * 0.7 }}>
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Propeller Animation */}
                <g className="propeller-system">
                    <rect className="propeller" x="110" y="20" width="3" height="40" rx="1.5" fill="#f8fafc">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 111.5 40"
                            to="360 111.5 40"
                            dur="0.04s"
                            repeatCount="indefinite"
                        />
                    </rect>
                    <circle cx="111.5" cy="40" r="4" fill="#1e293b" />
                </g>

                {/* Main Fuselage */}
                <path d="M10 40 L30 35 L100 35 L112 40 L100 45 L30 45 Z" fill="#e11d48" stroke="#991b1b" strokeWidth="1" />

                {/* Tail Section */}
                <path d="M10 40 L5 20 L25 35 Z" fill="#be123c" /> {/* Top Vertical */}
                <path d="M10 40 L15 50 L30 45 Z" fill="#991b1b" /> {/* Bottom Vertical */}
                <path d="M10 40 L5 30 L10 35 Z" fill="#be123c" />

                {/* Main Wing (Low Wing design) */}
                <path d="M40 40 L90 25 L95 30 L45 45 Z" fill="#e11d48" stroke="#991b1b" strokeWidth="1" />
                <path d="M40 40 L90 55 L95 50 L45 35 Z" fill="#e11d48" stroke="#991b1b" strokeWidth="1" opacity="0.8" />

                {/* The "X" Branding */}
                <path d="M75 37 L85 43 M85 37 L75 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

                {/* Cockpit Canopy */}
                <path d="M45 35 C45 30 65 28 85 35" fill="black" opacity="0.6" />
                <path d="M50 34 L80 34" stroke="white" strokeWidth="0.8" opacity="0.3" />

                <defs>
                    <filter id="planeGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
            </svg>

            <style jsx>{`
                .plane-container {
                    filter: drop-shadow(0 0 15px rgba(225, 29, 72, 0.7));
                }
                .propeller {
                    transform-box: fill-box;
                    transform-origin: center;
                }
                svg {
                    overflow: visible;
                }
            `}</style>
        </div>
    );
}
