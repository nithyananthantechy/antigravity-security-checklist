import React from 'react';

const DesicrewLogo = ({ size = 'large', className = '' }) => {
    const styles = {
        large: { width: '200px', fontSize: '2rem' },
        medium: { width: '150px', fontSize: '1.5rem' },
        small: { width: '120px', fontSize: '1.2rem' }
    };

    const currentStyle = styles[size] || styles.large;

    return (
        <div className={`desicrew-logo ${className}`} style={{ textAlign: 'center', ...currentStyle }}>
            <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' }}>
                {/* Abstract D Icon */}
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>

                {/* Icon Part */}
                <path d="M40 10 L80 10 C100 10 110 30 110 40 C110 50 100 70 80 70 L40 70 Z"
                    fill="none" stroke="url(#logoGradient)" strokeWidth="8" />
                <path d="M50 20 L50 60" stroke="#fff" strokeWidth="4" strokeLinecap="round" />

                {/* Text Part */}
                <text x="130" y="55" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="48" fill="#fff" letterSpacing="2">
                    DESICREW
                </text>
            </svg>
        </div>
    );
};

export default DesicrewLogo;
