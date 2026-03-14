import React from 'react';

const DesicrewLogo = ({ size = 'large', className = '' }) => {
    const styles = {
        large: { width: '200px', fontSize: '2rem' },
        medium: { width: '150px', fontSize: '1.5rem' },
        small: { width: '120px', fontSize: '1.2rem' }
    };

    const currentStyle = styles[size] || styles.large;

    return (
        <img 
            src="/desicrew.png" 
            alt="DesiCrew" 
            className={`desicrew-logo ${className}`} 
            style={{ ...currentStyle, objectFit: 'contain' }} 
        />
    );
};

export default DesicrewLogo;
