import React, { useMemo } from 'react';
import type { UMLDiagramData, ClassEntity, UMLRelationship, Position } from '@shared/types';
import type { LayoutResult } from '../stores/umlDiagramStore';
import { ClassBox } from './ClassBox';
import { RelationshipLineRenderer } from './RelationshipLineRenderer';
import { PackageContainer } from './PackageContainer';

interface DiagramCanvasProps {
  data: UMLDiagramData;
  layoutResult: LayoutResult | null;
  zoom: number;
  pan: Position;
  selectedClassIds: Set<string>;
  hoveredElement: ClassEntity | UMLRelationship | null;
  onClassSelect: (classEntity: ClassEntity, multi: boolean) => void;
  onHover: (element: ClassEntity | null, event?: MouseEvent) => void;
  onPanChange: (pan: Position) => void;
  onZoomChange: (zoom: number) => void;
}

export function DiagramCanvas({
  data,
  layoutResult,
  zoom,
  pan,
  selectedClassIds,
  hoveredElement,
  onClassSelect,
  onHover,
  onPanChange
}: DiagramCanvasProps) {
  // State for panning
  const isDragging = React.useRef(false);
  const lastMousePos = React.useRef({ x: 0, y: 0 });

  // Panning handlers
  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click

    // Don't start drag if clicking on a class box or other interactive element
    if ((e.target as Element).closest('.class-box')) return;

    e.preventDefault();
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;

    e.preventDefault();
    const splitX = e.clientX - lastMousePos.current.x;
    const splitY = e.clientY - lastMousePos.current.y;

    onPanChange({
      x: pan.x + splitX,
      y: pan.y + splitY
    });

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [pan, onPanChange]);

  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
  }, []);

  // Calculate package bounds
  const packages = useMemo(() => {
    if (!layoutResult) return [];

    const packageMap = new Map<string, { x1: number, y1: number, x2: number, y2: number }>();

    data.classes.forEach((cls: ClassEntity) => {
      if (!cls.package) return;

      const pos = layoutResult.positions.get(cls.id);
      if (!pos) return;

      // Assume max box size for bounds calculation since actual size varies
      const halfWidth = 100; // 200/2
      const halfHeight = 100; // Approximate max half height

      const x1 = pos.x - halfWidth;
      const y1 = pos.y - halfHeight;
      const x2 = pos.x + halfWidth;
      const y2 = pos.y + halfHeight;

      if (!packageMap.has(cls.package)) {
        packageMap.set(cls.package, { x1, y1, x2, y2 });
      } else {
        const bounds = packageMap.get(cls.package)!;
        bounds.x1 = Math.min(bounds.x1, x1);
        bounds.y1 = Math.min(bounds.y1, y1);
        bounds.x2 = Math.max(bounds.x2, x2);
        bounds.y2 = Math.max(bounds.y2, y2);
      }
    });

    return Array.from(packageMap.entries()).map(([name, bounds]) => ({
      name,
      bounds: {
        x: bounds.x1 - 20, // Add padding
        y: bounds.y1 - 40, // Add top padding for tab
        width: bounds.x2 - bounds.x1 + 40,
        height: bounds.y2 - bounds.y1 + 60
      }
    }));
  }, [data.classes, layoutResult]);

  if (!layoutResult) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Computing layout...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden cursor-move">
      <svg
        width="100%"
        height="100%"
        viewBox={`${layoutResult.bounds.x} ${layoutResult.bounds.y} ${layoutResult.bounds.width} ${layoutResult.bounds.height}`}
        className="overflow-visible"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Render packages first (background layer) */}
        {packages.map(pkg => (
          <PackageContainer
            key={pkg.name}
            name={pkg.name}
            bounds={pkg.bounds}
            zoom={zoom}
          />
        ))}

        {/* Render relationships (middle layer) */}
        <RelationshipLineRenderer
          relationships={data.relationships}
          classPositions={layoutResult.positions}
          classes={new Map(data.classes.map((c: ClassEntity) => [c.id, c]))}
          zoom={zoom}
        />

        {/* Render classes (top layer) */}
        {data.classes.map((classEntity: ClassEntity) => {
          const position = layoutResult.positions.get(classEntity.id);
          if (!position) return null;

          const isSelected = selectedClassIds.has(classEntity.id);
          const isHovered = hoveredElement?.id === classEntity.id;

          return (
            <ClassBox
              key={classEntity.id}
              classEntity={classEntity}
              position={position}
              zoom={zoom}
              selected={isSelected}
              hovered={isHovered}
              onHover={(entity, event) => onHover(entity, event)}
              onHoverEnd={() => onHover(null)}
              onClick={(entity) => onClassSelect(entity, false)}
            />
          );
        })}
      </svg>
    </div>
  );
}