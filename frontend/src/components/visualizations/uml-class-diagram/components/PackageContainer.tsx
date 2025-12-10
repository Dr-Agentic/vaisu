import React from 'react';

interface PackageContainerProps {
    name: string;
    bounds: { x: number; y: number; width: number; height: number };
    zoom: number;
}

export function PackageContainer({ name, bounds, zoom }: PackageContainerProps) {
    // Scale label size with zoom but clamp it
    const fontSize = Math.max(10, Math.min(14, 12 * zoom));
    const tabHeight = 20;
    const tabWidth = Math.max(100, name.length * 8);

    return (
        <g className="package-container">
            {/* Tab/Label Background */}
            <path
                d={`M ${bounds.x} ${bounds.y} 
            L ${bounds.x} ${bounds.y - tabHeight} 
            L ${bounds.x + tabWidth} ${bounds.y - tabHeight} 
            L ${bounds.x + tabWidth} ${bounds.y} 
            Z`}
                fill="#F3F4F6"
                stroke="#9CA3AF"
                strokeWidth="1"
            />

            {/* Main Box */}
            <rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                fill="#F9FAFB"
                fillOpacity="0.5"
                stroke="#9CA3AF"
                strokeWidth="1"
                strokeDasharray="4 2"
                rx="4"
            />

            {/* Label */}
            <text
                x={bounds.x + 8}
                y={bounds.y - 6}
                fontSize={fontSize}
                fontWeight="bold"
                fill="#4B5563"
                style={{ pointerEvents: 'none' }}
            >
                {name}
            </text>
        </g>
    );
}
