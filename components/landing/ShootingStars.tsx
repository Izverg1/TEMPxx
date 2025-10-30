import React from 'react';

const STAR_COUNT = 7;

const ShootingStars: React.FC = () => {
    const stars = Array.from({ length: STAR_COUNT }).map((_, i) => {
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 10}s`,
        };
        return <div key={i} className="shooting-star" style={style} />;
    });

    return (
        <div className="shooting-stars-container">
            {stars}
        </div>
    );
};

export default ShootingStars;
