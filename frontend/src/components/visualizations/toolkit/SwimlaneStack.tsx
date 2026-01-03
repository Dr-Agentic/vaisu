import React from 'react';

interface SwimlaneStackProps {
  children: React.ReactNode;
  className?: string;
}

export const SwimlaneStack: React.FC<SwimlaneStackProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-8 w-full ${className}`}>
      {children}
    </div>
  );
};
