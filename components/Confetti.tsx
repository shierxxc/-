
import React from 'react';

const Confetti: React.FC = () => {
  const confettiCount = 100;
  const colors = ['#f472b6', '#60a5fa', '#34d399', '#f59e0b', '#8b5cf6'];

  const confetti = Array.from({ length: confettiCount }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animation: `fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s infinite`,
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${Math.random() * 8 + 6}px`,
      height: `${Math.random() * 8 + 6}px`,
      opacity: Math.random() + 0.5,
    };
    return <div key={i} className="confetti-piece" style={style}></div>;
  });

  return (
    <>
      <style>{`
        .confetti-piece {
          position: absolute;
          top: -20px;
        }
        @keyframes fall {
          0% { top: -20px; }
          100% { top: 120%; }
        }
      `}</style>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
        {confetti}
      </div>
    </>
  );
};

export default Confetti;
