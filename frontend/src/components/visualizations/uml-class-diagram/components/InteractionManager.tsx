import React, { useCallback, useEffect, useRef } from 'react';
import type { ClassEntity, Position } from '@shared/types';

interface InteractionManagerProps {
  zoom: number;
  pan: Position;
  selectedClassIds: Set<string>;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: Position) => void;
  onClassSelect: (classEntity: ClassEntity, multi: boolean) => void;
  children: React.ReactNode;
}

interface PanZoomState {
  isDragging: boolean;
  lastMousePos: Position;
  momentum: Position;
}

/**
 * Handles pan and zoom interactions with momentum and smooth scaling
 */
export const InteractionManager: React.FC<InteractionManagerProps> = ({
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoomState = useRef<PanZoomState>({
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    momentum: { x: 0, y: 0 }
  });

  // Handle mouse wheel zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate zoom factor
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3.0, zoom * zoomFactor));

    // Zoom towards cursor position
    const zoomRatio = newZoom / zoom;
    const newPan = {
      x: mouseX - (mouseX - pan.x) * zoomRatio,
      y: mouseY - (mouseY - pan.y) * zoomRatio
    };

    onZoomChange(newZoom);
    onPanChange(newPan);
  }, [zoom, pan, onZoomChange, onPanChange]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left mouse button

    panZoomState.current.isDragging = true;
    panZoomState.current.lastMousePos = { x: event.clientX, y: event.clientY };
    panZoomState.current.momentum = { x: 0, y: 0 };

    event.preventDefault();
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!panZoomState.current.isDragging) return;

    const deltaX = event.clientX - panZoomState.current.lastMousePos.x;
    const deltaY = event.clientY - panZoomState.current.lastMousePos.y;

    // Update momentum for smooth deceleration
    panZoomState.current.momentum = { x: deltaX, y: deltaY };

    const newPan = {
      x: pan.x + deltaX,
      y: pan.y + deltaY
    };

    onPanChange(newPan);

    panZoomState.current.lastMousePos = { x: event.clientX, y: event.clientY };
  }, [pan, onPanChange]);

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    if (!panZoomState.current.isDragging) return;

    panZoomState.current.isDragging = false;

    // Apply momentum for smooth deceleration
    const applyMomentum = () => {
      const { momentum } = panZoomState.current;
      const friction = 0.95;

      if (Math.abs(momentum.x) > 0.1 || Math.abs(momentum.y) > 0.1) {
        const newPan = {
          x: pan.x + momentum.x,
          y: pan.y + momentum.y
        };

        onPanChange(newPan);

        panZoomState.current.momentum = {
          x: momentum.x * friction,
          y: momentum.y * friction
        };

        requestAnimationFrame(applyMomentum);
      }
    };

    requestAnimationFrame(applyMomentum);
  }, [pan, onPanChange]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      // Single touch - start panning
      const touch = event.touches[0];
      panZoomState.current.isDragging = true;
      panZoomState.current.lastMousePos = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      // Two touches - prepare for pinch zoom
      panZoomState.current.isDragging = false;
    }

    event.preventDefault();
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1 && panZoomState.current.isDragging) {
      // Single touch panning
      const touch = event.touches[0];
      const deltaX = touch.clientX - panZoomState.current.lastMousePos.x;
      const deltaY = touch.clientY - panZoomState.current.lastMousePos.y;

      const newPan = {
        x: pan.x + deltaX,
        y: pan.y + deltaY
      };

      onPanChange(newPan);
      panZoomState.current.lastMousePos = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      // Pinch to zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Store initial distance on first pinch
      if (!panZoomState.current.lastMousePos.x) {
        panZoomState.current.lastMousePos.x = distance;
        return;
      }

      const zoomFactor = distance / panZoomState.current.lastMousePos.x;
      const newZoom = Math.max(0.1, Math.min(3.0, zoom * zoomFactor));

      onZoomChange(newZoom);
      panZoomState.current.lastMousePos.x = distance;
    }

    event.preventDefault();
  }, [zoom, pan, onZoomChange, onPanChange]);

  const handleTouchEnd = useCallback(() => {
    panZoomState.current.isDragging = false;
    panZoomState.current.lastMousePos = { x: 0, y: 0 };
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'f':
      case 'F':
        // Zoom to fit
        event.preventDefault();
        onZoomChange(1.0);
        onPanChange({ x: 0, y: 0 });
        break;

      case 'r':
      case 'R':
        // Reset view
        event.preventDefault();
        onZoomChange(1.0);
        onPanChange({ x: 0, y: 0 });
        break;

      case '+':
      case '=':
        // Zoom in
        event.preventDefault();
        onZoomChange(Math.min(3.0, zoom * 1.2));
        break;

      case '-':
      case '_':
        // Zoom out
        event.preventDefault();
        onZoomChange(Math.max(0.1, zoom / 1.2));
        break;
    }
  }, [zoom, onZoomChange, onPanChange]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events
    container.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Touch events
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        transition: panZoomState.current.isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {children}
    </div>
  );
};

/**
 * Selection manager for highlighting and multi-select
 */
interface SelectionManagerProps {
  selectedClassIds: Set<string>;
  hoveredClassId: string | null;
  classes: ClassEntity[];
  relationships: Array<{ source: string; target: string; type: string }>;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

export const SelectionManager = ({
  selectedClassIds,
  classes,
  relationships,
  onSelectionChange
}: SelectionManagerProps) => {
  // Get connected classes for a given class
  const getConnectedClasses = useCallback((classId: string): Set<string> => {
    const connected = new Set<string>();

    relationships.forEach(rel => {
      if (rel.source === classId) {
        connected.add(rel.target);
      } else if (rel.target === classId) {
        connected.add(rel.source);
      }
    });

    return connected;
  }, [relationships]);

  // Get full inheritance chain for a class
  const getInheritanceChain = useCallback((classId: string): Set<string> => {
    const chain = new Set<string>();
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      chain.add(id);

      // Find parent classes (inheritance relationships)
      relationships.forEach(rel => {
        if (rel.type === 'inheritance') {
          if (rel.source === id) {
            traverse(rel.target); // Parent
          } else if (rel.target === id) {
            traverse(rel.source); // Child
          }
        }
      });
    };

    traverse(classId);
    return chain;
  }, [relationships]);

  // Handle class selection with multi-select support
  const handleClassSelect = useCallback((classEntity: ClassEntity, multi: boolean) => {
    if (multi) {
      // Multi-select mode
      const newSelection = new Set(selectedClassIds);
      if (newSelection.has(classEntity.id)) {
        newSelection.delete(classEntity.id);
      } else {
        newSelection.add(classEntity.id);
      }
      onSelectionChange(newSelection);
    } else {
      // Single select mode
      const newSelection = new Set([classEntity.id]);
      onSelectionChange(newSelection);
    }
  }, [selectedClassIds, onSelectionChange]);

  // Handle trace inheritance mode
  const handleTraceInheritance = useCallback((classId: string) => {
    const inheritanceChain = getInheritanceChain(classId);
    onSelectionChange(inheritanceChain);
  }, [getInheritanceChain, onSelectionChange]);

  // Calculate which classes should be dimmed
  const getDimmedClasses = useCallback((): Set<string> => {
    if (selectedClassIds.size === 0) return new Set();

    const connectedClasses = new Set<string>();
    selectedClassIds.forEach(id => {
      connectedClasses.add(id);
      const connected = getConnectedClasses(id);
      connected.forEach(connectedId => connectedClasses.add(connectedId));
    });

    const dimmedClasses = new Set<string>();
    classes.forEach(cls => {
      if (!connectedClasses.has(cls.id)) {
        dimmedClasses.add(cls.id);
      }
    });

    return dimmedClasses;
  }, [selectedClassIds, classes, getConnectedClasses]);

  return {
    handleClassSelect,
    handleTraceInheritance,
    getConnectedClasses,
    getInheritanceChain,
    getDimmedClasses: getDimmedClasses()
  };
};

/**
 * Hover effects manager with smooth animations
 */
interface HoverEffectsProps {
  classId: string;
  isHovered: boolean;
  isSelected: boolean;
  isDimmed: boolean;
}

export const HoverEffects: React.FC<HoverEffectsProps> = ({
  classId,
  isHovered,
  isSelected,
  isDimmed
}) => {
  const getClassStyle = () => {
    let transform = 'scale(1)';
    let opacity = 1;
    let filter = '';

    if (isDimmed) {
      opacity = 0.3;
    }

    if (isHovered) {
      transform = 'scale(1.05)';
      filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))';
    }

    if (isSelected) {
      filter += ' drop-shadow(0 0 0 3px #3B82F6)';
    }

    return {
      transform,
      opacity,
      filter,
      transition: 'all 0.15s ease-out'
    };
  };

  return (
    <style>
      {`
        .class-box[data-class-id="${classId}"] {
          transform: ${getClassStyle().transform};
          opacity: ${getClassStyle().opacity};
          filter: ${getClassStyle().filter};
          transition: ${getClassStyle().transition};
        }
        
        .class-box[data-class-id="${classId}"]:active {
          animation: clickPulse 0.2s ease-out;
        }
        
        @keyframes clickPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}
    </style>
  );
};

/**
 * Zoom to fit functionality
 */
export const zoomToFit = (
  bounds: { x: number; y: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 50
): { zoom: number; pan: Position } => {
  const scaleX = (viewportWidth - 2 * padding) / bounds.width;
  const scaleY = (viewportHeight - 2 * padding) / bounds.height;
  const zoom = Math.min(scaleX, scaleY, 1.0); // Don't zoom in beyond 100%

  const pan = {
    x: (viewportWidth - bounds.width * zoom) / 2 - bounds.x * zoom,
    y: (viewportHeight - bounds.height * zoom) / 2 - bounds.y * zoom
  };

  return { zoom, pan };
};

/**
 * Zoom to selection functionality
 */
export const zoomToSelection = (
  selectedPositions: Position[],
  viewportWidth: number,
  viewportHeight: number,
  nodeWidth: number = 200,
  nodeHeight: number = 120,
  padding: number = 50
): { zoom: number; pan: Position } => {
  if (selectedPositions.length === 0) {
    return { zoom: 1.0, pan: { x: 0, y: 0 } };
  }

  // Calculate bounding box of selected classes
  const minX = Math.min(...selectedPositions.map(p => p.x));
  const maxX = Math.max(...selectedPositions.map(p => p.x + nodeWidth));
  const minY = Math.min(...selectedPositions.map(p => p.y));
  const maxY = Math.max(...selectedPositions.map(p => p.y + nodeHeight));

  const bounds = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };

  return zoomToFit(bounds, viewportWidth, viewportHeight, padding);
};