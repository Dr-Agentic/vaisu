import React from 'react';

interface GraphBackgroundProps {
  className?: string;
}

export const GraphBackground: React.FC<GraphBackgroundProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 bg-slate-50 ${className}`}
      style={{
        backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }}
    />
  );
};
