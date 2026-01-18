import React from 'react';

interface GraphBackgroundProps {
  className?: string;
}

export const GraphBackground: React.FC<GraphBackgroundProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 bg-[var(--color-surface-base)] ${className}`}
      style={{
        backgroundImage: 'radial-gradient(var(--color-border-base) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      }}
    />
  );
};
