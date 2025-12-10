import React from 'react';
import type { ClassEntity } from '@shared/types';

interface ProgressiveDisclosureProps {
  classEntity: ClassEntity;
  zoom: number;
  children: React.ReactNode;
}

interface VisibilityConfig {
  showAttributes: boolean;
  showMethods: boolean;
  showDetails: boolean;
  showParameterNames: boolean;
  showEdgeLabels: boolean;
}

/**
 * Determines what should be visible at the current zoom level
 */
export function getVisibilityConfig(zoom: number): VisibilityConfig {
  if (zoom < 0.6) {
    // Very zoomed out - show only class names
    return {
      showAttributes: false,
      showMethods: false,
      showDetails: false,
      showParameterNames: false,
      showEdgeLabels: false
    };
  } else if (zoom < 0.9) {
    // Medium zoom - show attributes but hide methods
    return {
      showAttributes: true,
      showMethods: false,
      showDetails: false,
      showParameterNames: false,
      showEdgeLabels: false
    };
  } else if (zoom < 1.5) {
    // Normal zoom - show all compartments
    return {
      showAttributes: true,
      showMethods: true,
      showDetails: false,
      showParameterNames: false,
      showEdgeLabels: false
    };
  } else {
    // High zoom - show enhanced details
    return {
      showAttributes: true,
      showMethods: true,
      showDetails: true,
      showParameterNames: true,
      showEdgeLabels: true
    };
  }
}

/**
 * Calculates appropriate font size based on zoom level
 */
export function getFontSize(zoom: number, baseSize: number = 12): number {
  return Math.max(8, Math.min(18, baseSize * zoom));
}

/**
 * Calculates line thickness based on zoom level
 */
export function getLineThickness(zoom: number, baseThickness: number = 1): number {
  return Math.max(1, Math.min(3, baseThickness * zoom));
}

/**
 * Determines if compartment should be scrollable based on member count
 */
export function shouldUseScrollableCompartment(memberCount: number, zoom: number): boolean {
  const maxVisibleMembers = zoom > 1.2 ? 15 : 10;
  return memberCount > maxVisibleMembers;
}

/**
 * Formats method signature based on zoom level and visibility config
 */
export function formatMethodSignature(
  method: ClassEntity['methods'][0],
  config: VisibilityConfig
): string {
  const visibility = getVisibilitySymbol(method.visibility);
  const name = method.isAbstract ? `<i>${method.name}</i>` : method.name;
  const isStatic = method.isStatic ? '<u>' : '';
  const staticClose = method.isStatic ? '</u>' : '';
  
  if (!config.showParameterNames) {
    // Simple signature without parameter names
    const paramCount = method.parameters.length;
    const params = paramCount > 0 ? `${paramCount} params` : '';
    return `${visibility}${isStatic}${name}(${params}): ${method.returnType}${staticClose}`;
  }
  
  // Full signature with parameter names
  const params = method.parameters
    .map(p => `${p.name}: ${p.type}`)
    .join(', ');
  
  return `${visibility}${isStatic}${name}(${params}): ${method.returnType}${staticClose}`;
}

/**
 * Formats attribute signature based on zoom level and visibility config
 */
export function formatAttributeSignature(
  attribute: ClassEntity['attributes'][0],
  config: VisibilityConfig
): string {
  const visibility = getVisibilitySymbol(attribute.visibility);
  const isStatic = attribute.isStatic ? '<u>' : '';
  const staticClose = attribute.isStatic ? '</u>' : '';
  
  let signature = `${visibility}${isStatic}${attribute.name}: ${attribute.type}${staticClose}`;
  
  if (config.showDetails && attribute.defaultValue) {
    signature += ` = ${attribute.defaultValue}`;
  }
  
  return signature;
}

/**
 * Gets UML visibility symbol
 */
function getVisibilitySymbol(visibility: string): string {
  switch (visibility) {
    case 'public': return '+';
    case 'private': return '-';
    case 'protected': return '#';
    case 'package': return '~';
    default: return '+';
  }
}

/**
 * Animated container for smooth zoom transitions
 */
export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  classEntity,
  zoom,
  children
}) => {
  const config = getVisibilityConfig(zoom);
  const fontSize = getFontSize(zoom);
  
  return (
    <div
      className="transition-all duration-250 ease-out"
      style={{
        fontSize: `${fontSize}px`,
        transform: `scale(${Math.max(0.8, Math.min(1.2, zoom))})`
      }}
    >
      {children}
    </div>
  );
};

/**
 * Compartment component with progressive disclosure
 */
interface CompartmentProps {
  title: string;
  items: Array<{ id: string; signature: string }>;
  zoom: number;
  visible: boolean;
  maxItems?: number;
}

export const ProgressiveCompartment: React.FC<CompartmentProps> = ({
  title,
  items,
  zoom,
  visible,
  maxItems = 10
}) => {
  if (!visible) return null;
  
  const shouldScroll = shouldUseScrollableCompartment(items.length, zoom);
  const displayItems = shouldScroll ? items.slice(0, maxItems) : items;
  const hasMore = shouldScroll && items.length > maxItems;
  
  return (
    <div className="compartment border-t border-gray-300">
      <div className="compartment-header text-xs font-semibold text-gray-600 px-2 py-1">
        {title} ({items.length})
      </div>
      <div 
        className={`compartment-content px-2 py-1 ${shouldScroll ? 'max-h-32 overflow-y-auto' : ''}`}
        style={{ fontSize: getFontSize(zoom, 10) }}
      >
        {displayItems.map(item => (
          <div 
            key={item.id} 
            className="text-xs leading-tight mb-1"
            dangerouslySetInnerHTML={{ __html: item.signature }}
          />
        ))}
        {hasMore && (
          <div className="text-xs text-gray-500 italic">
            ... and {items.length - maxItems} more
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Enhanced details panel for high zoom levels
 */
interface EnhancedDetailsProps {
  classEntity: ClassEntity;
  zoom: number;
  visible: boolean;
}

export const EnhancedDetails: React.FC<EnhancedDetailsProps> = ({
  classEntity,
  zoom,
  visible
}) => {
  if (!visible || zoom < 1.5) return null;
  
  return (
    <div className="enhanced-details bg-gray-50 border-t border-gray-300 p-2 text-xs">
      {classEntity.stereotype && (
        <div className="stereotype text-gray-600 italic mb-1">
          &lt;&lt;{classEntity.stereotype}&gt;&gt;
        </div>
      )}
      {classEntity.package && (
        <div className="package text-gray-600 mb-1">
          Package: {classEntity.package}
        </div>
      )}
      {classEntity.description && (
        <div className="description text-gray-700 text-xs leading-tight">
          {classEntity.description}
        </div>
      )}
    </div>
  );
};

/**
 * Zoom-based edge label component
 */
interface ZoomBasedEdgeLabelProps {
  text: string;
  zoom: number;
  minZoom?: number;
  x: number;
  y: number;
}

export const ZoomBasedEdgeLabel: React.FC<ZoomBasedEdgeLabelProps> = ({
  text,
  zoom,
  minZoom = 1.2,
  x,
  y
}) => {
  if (zoom < minZoom) return null;
  
  return (
    <text
      x={x}
      y={y}
      fontSize={getFontSize(zoom, 10)}
      fill="#6b7280"
      textAnchor="middle"
      dominantBaseline="middle"
      className="pointer-events-none select-none transition-opacity duration-250"
      style={{ opacity: Math.min(1, (zoom - minZoom) / 0.3) }}
    >
      {text}
    </text>
  );
};