import React, { useMemo } from 'react';

import {
  getVisibilityConfig,
  getFontSize,
  formatMethodSignature,
  formatAttributeSignature,
} from './ProgressiveDisclosure';

import type { ClassEntity, Position } from '@shared/types';

interface ClassBoxProps {
  classEntity: ClassEntity;
  position: Position;
  zoom: number;
  selected: boolean;
  hovered: boolean;
  onHover: (entity: ClassEntity, event: MouseEvent) => void;
  onHoverEnd: () => void;
  onClick: (entity: ClassEntity) => void;
}

export const ClassBox = React.memo(({
  classEntity,
  position,
  zoom,
  selected,
  hovered,
  onHover,
  onHoverEnd,
  onClick,
}: ClassBoxProps) => {
  // Local state for collapsible compartments
  const [isAttributesCollapsed, setIsAttributesCollapsed] = React.useState(false);
  const [isMethodsCollapsed, setIsMethodsCollapsed] = React.useState(false);

  // Calculate visibility based on zoom level using progressive disclosure
  const visibility = useMemo(() => {
    const config = getVisibilityConfig(zoom);
    return {
      ...config,
      fontSize: getFontSize(zoom, 12),
      compartmentPadding: Math.max(4, Math.min(10, zoom * 6)),
    };
  }, [zoom]);

  // Get class type styling
  const getClassTypeStyle = (type: string) => {
    switch (type) {
      case 'interface':
        return {
          borderColor: '#10B981', // green
          backgroundColor: '#F0FDF4',
          textColor: '#065F46',
        };
      case 'abstract':
        return {
          borderColor: '#8B5CF6', // purple
          backgroundColor: '#FAF5FF',
          textColor: '#581C87',
        };
      case 'enum':
        return {
          borderColor: '#F59E0B', // orange
          backgroundColor: '#FFFBEB',
          textColor: '#92400E',
        };
      default: // class
        return {
          borderColor: '#3B82F6', // blue
          backgroundColor: '#F8FAFC',
          textColor: '#1E40AF',
        };
    }
  };

  const typeStyle = getClassTypeStyle(classEntity.type);

  // Format signatures using progressive disclosure
  const formatAttribute = (attr: typeof classEntity.attributes[0]) => {
    return formatAttributeSignature(attr, visibility);
  };

  const formatMethod = (method: typeof classEntity.methods[0]) => {
    return formatMethodSignature(method, visibility);
  };

  // Calculate box dimensions
  const baseWidth = 200;
  const baseHeight = 60; // Base height for name compartment
  const lineHeight = visibility.fontSize + 4;
  const headerHeight = 20; // Height for compartment header

  let totalHeight = baseHeight;

  // Calculate attributes height
  const showAttributes = visibility.showAttributes && classEntity.attributes.length > 0;
  if (showAttributes) {
    totalHeight += headerHeight; // Divider/Header area
    if (!isAttributesCollapsed) {
      totalHeight += visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight;
    }
  }

  // Calculate methods height
  const showMethods = visibility.showMethods && classEntity.methods.length > 0;
  if (showMethods) {
    totalHeight += headerHeight; // Divider/Header area
    if (!isMethodsCollapsed) {
      totalHeight += visibility.compartmentPadding * 2 + classEntity.methods.length * lineHeight;
    }
  }

  const boxWidth = baseWidth;
  const boxHeight = totalHeight;

  // Calculate positions
  const x = position.x - boxWidth / 2;
  const y = position.y - boxHeight / 2;

  // Handle mouse events
  const handleMouseEnter = (event: React.MouseEvent) => {
    onHover(classEntity, event.nativeEvent);
  };

  const handleMouseLeave = () => {
    onHoverEnd();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(classEntity);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onClick(classEntity);
    }
  };

  const toggleAttributes = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.type === 'keydown') {
      const ke = e as React.KeyboardEvent;
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      ke.preventDefault();
    }
    setIsAttributesCollapsed(!isAttributesCollapsed);
  };

  const toggleMethods = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.type === 'keydown') {
      const ke = e as React.KeyboardEvent;
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      ke.preventDefault();
    }
    setIsMethodsCollapsed(!isMethodsCollapsed);
  };

  return (
    <g
      className="class-box cursor-pointer outline-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${classEntity.type} ${classEntity.name}`}
      aria-selected={selected}
    >
      {/* Main box */}
      <rect
        x={x}
        y={y}
        width={boxWidth}
        height={boxHeight}
        fill={typeStyle.backgroundColor}
        stroke={selected ? '#3B82F6' : typeStyle.borderColor}
        strokeWidth={selected ? 3 : 2}
        rx="8"
        className={`transition-all duration-150 ${hovered ? 'drop-shadow-lg' : ''} ${selected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          transformOrigin: 'center',
        }}
      />

      {/* Stereotype */}
      {classEntity.stereotype && (
        <text
          x={position.x}
          y={y + 20}
          textAnchor="middle"
          fontSize={visibility.fontSize - 2}
          fill="#6B7280"
          fontStyle="italic"
        >
          «{classEntity.stereotype}»
        </text>
      )}

      {/* Class name */}
      <text
        x={position.x}
        y={y + (classEntity.stereotype ? 38 : 28)}
        textAnchor="middle"
        fontSize={visibility.fontSize + 2}
        fontWeight="bold"
        fill={typeStyle.textColor}
        fontStyle={classEntity.type === 'abstract' ? 'italic' : 'normal'}
      >
        {classEntity.name}
      </text>

      {/* Interface indicator */}
      {classEntity.type === 'interface' && (
        <text
          x={position.x}
          y={y + (classEntity.stereotype ? 18 : 15)}
          textAnchor="middle"
          fontSize={visibility.fontSize - 2}
          fill="#059669"
          fontStyle="italic"
        >
          «interface»
        </text>
      )}

      {/* Attributes compartment */}
      {showAttributes && (
        <g>
          {/* Header/Divider Area */}
          <g
            onClick={toggleAttributes}
            onKeyDown={toggleAttributes}
            className="cursor-pointer hover:opacity-80 outline-none"
            role="button"
            tabIndex={0}
            aria-expanded={!isAttributesCollapsed}
            aria-label={`Toggle attributes for ${classEntity.name}`}
          >
            <rect
              x={x}
              y={y + baseHeight}
              width={boxWidth}
              height={headerHeight}
              fill="transparent"
            />
            <line
              x1={x}
              x2={x + boxWidth}
              y1={y + baseHeight}
              y2={y + baseHeight}
              stroke={typeStyle.borderColor}
              strokeWidth="1"
            />
            {/* Collapse Icon */}
            <path
              d={isAttributesCollapsed ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'}
              transform={`translate(${x + boxWidth - 20}, ${y + baseHeight + 5}) scale(0.6)`}
              fill="none"
              stroke={typeStyle.borderColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={x + 8}
              y={y + baseHeight + 14}
              fontSize={visibility.fontSize - 2}
              fill={typeStyle.textColor}
              fontWeight="bold"
              opacity="0.7"
            >
              Attributes
            </text>
          </g>

          {/* Attributes List */}
          {!isAttributesCollapsed && classEntity.attributes.map((attr, index) => (
            <text
              key={attr.id}
              x={x + visibility.compartmentPadding}
              y={y + baseHeight + headerHeight + (index + 1) * lineHeight}
              fontSize={visibility.fontSize}
              fill="#374151"
              fontFamily="monospace"
              textDecoration={attr.isStatic ? 'underline' : 'none'}
            >
              {formatAttribute(attr)}
            </text>
          ))}
        </g>
      )}

      {/* Methods compartment */}
      {showMethods && (
        <g>
          {/* Header/Divider Area */}
          <g
            onClick={toggleMethods}
            onKeyDown={toggleMethods}
            className="cursor-pointer hover:opacity-80 outline-none"
            role="button"
            tabIndex={0}
            aria-expanded={!isMethodsCollapsed}
            aria-label={`Toggle methods for ${classEntity.name}`}
          >
            <rect
              x={x}
              y={y + baseHeight + (showAttributes ? (isAttributesCollapsed ? headerHeight : headerHeight + visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight) : 0)}
              width={boxWidth}
              height={headerHeight}
              fill="transparent"
            />
            <line
              x1={x}
              x2={x + boxWidth}
              y1={y + baseHeight + (showAttributes ? (isAttributesCollapsed ? headerHeight : headerHeight + visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight) : 0)}
              y2={y + baseHeight + (showAttributes ? (isAttributesCollapsed ? headerHeight : headerHeight + visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight) : 0)}
              stroke={typeStyle.borderColor}
              strokeWidth="1"
            />
            {/* Collapse Icon */}
            <path
              d={isMethodsCollapsed ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'}
              transform={`translate(${x + boxWidth - 20}, ${y + baseHeight + (showAttributes ? (isAttributesCollapsed ? headerHeight : headerHeight + visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight) : 0) + 5}) scale(0.6)`}
              fill="none"
              stroke={typeStyle.borderColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={x + 8}
              y={y + baseHeight + (showAttributes ? (isAttributesCollapsed ? headerHeight : headerHeight + visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight) : 0) + 14}
              fontSize={visibility.fontSize - 2}
              fill={typeStyle.textColor}
              fontWeight="bold"
              opacity="0.7"
            >
              Methods
            </text>
          </g>

          {/* Methods List */}
          {!isMethodsCollapsed && classEntity.methods.map((method, index) => {
            const attributesHeight = showAttributes
              ? (isAttributesCollapsed
                ? headerHeight
                : headerHeight + visibility.compartmentPadding * 2 + classEntity.attributes.length * lineHeight)
              : 0;

            const methodY = y + baseHeight + attributesHeight + headerHeight + (index + 1) * lineHeight;

            return (
              <text
                key={method.id}
                x={x + visibility.compartmentPadding}
                y={methodY}
                fontSize={visibility.fontSize}
                fill="#374151"
                fontFamily="monospace"
                textDecoration={method.isStatic ? 'underline' : 'none'}
                fontStyle={method.isAbstract ? 'italic' : 'normal'}
              >
                {formatMethod(method)}
              </text>
            );
          })}
        </g>
      )}
    </g>
  );
});
