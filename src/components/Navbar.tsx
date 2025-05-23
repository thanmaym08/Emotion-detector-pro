import React from 'react';

const navbarStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '0.5rem 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '1.8rem', // Reduced from 2.5rem
    fontWeight: 700,    // Slightly lighter
    letterSpacing: '0.05em',
    color: 'white',
};

const Navbar = () => (
    <nav style={navbarStyle}>
        <h1 style={titleStyle}>
            🎭Emotion Detector Pro
        </h1>
    </nav>
);

export default Navbar;
