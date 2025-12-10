import React from 'react';
import type { Relationship, Position } from '@shared/types';
import { ZoomBasedEdgeLabel, getVisibilityConfig } from './ProgressiveDisclosure';

interface RelationshipLineRendererProps {
  relationships: Relationship[];
  classPositions: Map<string, Position>;
  zoom: number;
}

interface LineStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  markerEnd?: string;
  markerStart?: string;
}

interface ArrowMarkerProps {
  id: string;
  color: string;
  filled?: boolean;
  type: 'triangle' | 'diamond' | 'arrow';
}

const ArrowMarker: React.FC<ArrowMarkerProps> = ({ id, color, filled = false, type }) => {
  const renderMarker = () => {
    switch (type) {
      case 'triangle':
        return (
          <polygon
            points="0,0 10,5 0,10"
            fill={filled ? color : 'white'}
            stroke={color}
            strokeWidth="1"
          />
        );
      case 'diamond':
        return (
          <polygon
            points="0,5 5,0 10,5 5,10"
            fill={filled ? color : 'white'}
            stroke={color}
            strokeWidth="1"
          />
        );
      case 'arrow':
        return (
          <polygon
            points="0,0 10,5 0,10 3,5"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
        );
      default:
        return null;
    }
  };

  return (
    <marker
      id={id}
      markerWidth="12"
      markerHeight="12"
      refX="10"
      refY="5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      {renderMarker()}
    </marker>
  );
};

const getRelationshipStyle = (type: string, zoom: number): LineStyle => {
  const baseWidth = Math.max(1, Math.min(3, zoom * 1.5));
  
  switch (type) {
    case 'inheritance':
      return {
        stroke: '#3b82f6', // blue
        strokeWidth: baseWidth,
        markerEnd: 'url(#inheritance-end)'
      };
    case 'interface':
      return {
        stroke: '#10b981', // green
        strokeWidth: baseWidth,
        strokeDasharray: '5,5',
        markerEnd: 'url(#interface-end)'
      };
    case 'composition':
      return {
        stroke: '#ef4444', // red
        strokeWidth: baseWidth,
        markerStart: 'url(#composition-start)'
      };
    case 'aggregation':
      return {
        stroke: '#f97316', // orange
        strokeWidth: baseWidth,
        markerStart: 'url(#aggregation-start)'
      };
    case 'association':
      return {
        stroke: '#6b7280', // gray
        strokeWidth: baseWidth,
        markerEnd: 'url(#association-end)'
      };
    case 'dependency':
      return {
        stroke: '#9ca3af', // light gray
        strokeWidth: baseWidth,
        strokeDasharray: '3,3',
        markerEnd: 'url(#dependency-end)'
      };
    default:
      return {
        stroke: '#6b7280',
        strokeWidth: baseWidth
      };
  }
};

const calculateLinePoints = (
  from: Position,
  to: Position,
  fromId: string,
  toId: string,
  offset: number = 0
): string => {
  // Calculate connection points on class box edges
  const fromCenter = { x: from.x + 100, y: from.y + 60 }; // Assuming 200x120 class boxes
  const toCenter = { x: to.x + 100, y: to.y + 60 };
  
  // Calculate direction vector
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return '';
  
  // Normalize direction
  const unitX = dx / length;
  const unitY = dy / length;
  
  // Calculate edge connection points
  const fromEdge = {
    x: fromCenter.x + unitX * 100, // Half box width
    y: fromCenter.y + unitY * 60   // Half box height
  };
  
  const toEdge = {
    x: toCenter.x - unitX * 100,
    y: toCenter.y - unitY * 60
  };
  
  // Apply offset for parallel relationships
  const perpX = -unitY * offset;
  const perpY = unitX * offset;
  
  const startX = fromEdge.x + perpX;
  const startY = fromEdge.y + perpY;
  const endX = toEdge.x + perpX;
  const endY = toEdge.y + perpY;
  
  // Create orthogonal path for better readability
  const midX = startX + (endX - startX) * 0.5;
  
  return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
};

const MultiplicityLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  zoom: number;
}> = ({ text, x, y, zoom }) => {
  if (zoom < 0.9) return null;
  
  return (
    <text
      x={x}
      y={y}
      fontSize={Math.max(10, 12 * zoom)}
      fill="#374151"
      textAnchor="middle"
      dominantBaseline="middle"
      className="pointer-events-none select-none"
    >
      {text}
    </text>
  );
};

export const RelationshipLineRenderer: React.FC<RelationshipLineRendererProps> = ({
  relationships,
  classPositions,
  zoom
}) => {
  // Group parallel relationships for offset calculation
  const relationshipGroups = new Map<string, Relationship[]>();
  
  relationships.forEach(rel => {
    const key = [rel.from, rel.to].sort().join('-');
    if (!relationshipGroups.has(key)) {
      relationshipGroups.set(key, []);
    }
    relationshipGroups.get(key)!.push(rel);
  });

  return (
    <g className="relationship-lines">
      {/* Define arrow markers */}
      <defs>
        <ArrowMarker id="inheritance-end" color="#3b82f6" type="triangle" />
        <ArrowMarker id="interface-end" color="#10b981" type="triangle" />
        <ArrowMarker id="composition-start" color="#ef4444" filled type="diamond" />
        <ArrowMarker id="aggregation-start" color="#f97316" type="diamond" />
        <ArrowMarker id="association-end" color="#6b7280" type="arrow" />
        <ArrowMarker id="dependency-end" color="#9ca3af" type="arrow" />
      </defs>
      
      {Array.from(relationshipGroups.entries()).map(([groupKey, groupRels]) => {
        return groupRels.map((relationship, index) => {
          const fromPos = classPositions.get(relationship.from);
          const toPos = classPositions.get(relationship.to);
          
          if (!fromPos || !toPos) return null;
          
          const style = getRelationshipStyle(relationship.type, zoom);
          const offset = groupRels.length > 1 ? (index - (groupRels.length - 1) / 2) * 8 : 0;
          const pathData = calculateLinePoints(fromPos, toPos, relationship.from, relationship.to, offset);
          
          if (!pathData) return null;
          
          return (
            <g key={`${relationship.from}-${relationship.to}-${index}`}>
              <path
                d={pathData}
                fill="none"
                {...style}
                className="hover:stroke-opacity-80 transition-all duration-150"
              />
              
              {/* Multiplicity labels */}
              {relationship.multiplicity && zoom >= 0.9 && (
                <>
                  {relationship.multiplicity.from && (
                    <MultiplicityLabel
                      text={relationship.multiplicity.from}
                      x={fromPos.x + 120}
                      y={fromPos.y + 40}
                      zoom={zoom}
                    />
                  )}
                  {relationship.multiplicity.to && (
                    <MultiplicityLabel
                      text={relationship.multiplicity.to}
                      x={toPos.x + 80}
                      y={toPos.y + 40}
                      zoom={zoom}
                    />
                  )}
                </>
              )}
              
              {/* Role labels using progressive disclosure */}
              {relationship.roles && (
                <>
                  {relationship.roles.from && (
                    <ZoomBasedEdgeLabel
                      text={relationship.roles.from}
                      zoom={zoom}
                      minZoom={1.2}
                      x={fromPos.x + 110}
                      y={fromPos.y + 25}
                    />
                  )}
                  {relationship.roles.to && (
                    <ZoomBasedEdgeLabel
                      text={relationship.roles.to}
                      zoom={zoom}
                      minZoom={1.2}
                      x={toPos.x + 90}
                      y={toPos.y + 25}
                    />
                  )}
                </>
              )}
            </g>
          );
        });
      })}
    </g>
  );
};