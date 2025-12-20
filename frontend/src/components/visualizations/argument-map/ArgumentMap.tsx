import React, { useRef, useState, useEffect } from 'react';
import { ArgumentMapData } from '../../../../../shared/src/types';
import { useArgumentLayout } from './useArgumentLayout';
import { ArgumentNode } from './ArgumentNode';
import { ArgumentEdge } from './ArgumentEdge';
import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ArgumentMapProps {
    data: ArgumentMapData;
    width?: number;
    height?: number;
    className?: string;
}

export function ArgumentMap({ data, width = 800, height = 600, className }: ArgumentMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Compute Layout
    // We use a large virtual size for the layout to ensure enough space
    const layout = useArgumentLayout(data, 2000, 2000);

    // Center initial view
    useEffect(() => {
        if (layout.nodes.length > 0 && containerRef.current) {
            // Find center of nodes
            const xs = layout.nodes.map(n => n.x);
            const ys = layout.nodes.map(n => n.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const contentCenterX = (minX + maxX) / 2;
            const contentCenterY = (minY + maxY) / 2;

            setPan({
                x: width / 2 - contentCenterX,
                y: height / 2 - contentCenterY
            });
        }
    }, [width, height, layout.nodes]); // Only re-center on data change or resize

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.min(Math.max(z * delta, 0.1), 3));
        } else {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden bg-slate-50 border border-slate-200 rounded-lg select-none", className)}
            style={{ width, height }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2 z-50">
                <button
                    onClick={() => setZoom(z => Math.min(z * 1.2, 3))}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setZoom(z => Math.max(z / 1.2, 0.1))}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setZoom(1)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                    title="Reset Zoom"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Canvas */}
            <div
                className="absolute transition-transform duration-75 ease-linear origin-top-left"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    width: layout.width,
                    height: layout.height
                }}
            >
                {/* Edges Layer */}
                <svg
                    width={layout.width}
                    height={layout.height}
                    className="absolute top-0 left-0 pointer-events-none"
                >
                    <defs>
                        <marker id="marker-supports" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                        </marker>
                        <marker id="marker-attacks" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                        </marker>
                        <marker id="marker-is-alternative-to" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                        </marker>
                        <marker id="marker-rebuts" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                        </marker>
                    </defs>
                    {layout.edges.map(edge => {
                        const source = layout.nodes.find(n => n.id === edge.source);
                        const target = layout.nodes.find(n => n.id === edge.target);
                        if (!source || !target) return null;
                        return (
                            <ArgumentEdge
                                key={edge.id}
                                edge={edge}
                                source={source}
                                target={target}
                            />
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                {layout.nodes.map(node => (
                    <ArgumentNode
                        key={node.id}
                        node={node}
                        x={node.x}
                        y={node.y}
                        isSelected={selectedNodeId === node.id}
                        onSelect={setSelectedNodeId}
                    />
                ))}
            </div>
        </div>
    );
}
