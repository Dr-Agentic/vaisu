import { create } from 'zustand';
import type { 
  UMLDiagramData, 
  ClassEntity, 
  UMLRelationship, 
  Position 
} from '@shared/types';

export interface FilterState {
  visibleTypes: Set<'class' | 'interface' | 'abstract' | 'enum'>;
  visibleStereotypes: Set<string>;
  visiblePackages: Set<string>;
  visibleRelationships: Set<'inheritance' | 'realization' | 'composition' | 'aggregation' | 'association' | 'dependency'>;
  searchQuery: string;
}

export interface LayoutResult {
  positions: Map<string, Position>;
  edges: Map<string, { points: Position[] }>;
  bounds: { x: number; y: number; width: number; height: number };
  computationTime: number;
}

interface UMLDiagramState {
  // Data
  data: UMLDiagramData | null;
  layoutResult: LayoutResult | null;
  
  // Viewport
  zoom: number;
  pan: Position;
  
  // Selection
  selectedClassIds: Set<string>;
  selectedRelationshipIds: Set<string>;
  
  // Hover
  hoveredElement: ClassEntity | UMLRelationship | null;
  tooltipVisible: boolean;
  tooltipPosition: Position;
  
  // Filters
  filters: FilterState;
  
  // UI State
  isLayouting: boolean;
  layoutAlgorithm: 'hierarchical' | 'force-directed';
  showLegend: boolean;
  showPackages: boolean;
  
  // Actions
  setData: (data: UMLDiagramData) => void;
  setLayoutResult: (result: LayoutResult) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;
  selectClass: (id: string, multi: boolean) => void;
  selectRelationship: (id: string) => void;
  clearSelection: () => void;
  setHoveredElement: (element: ClassEntity | UMLRelationship | null, position?: Position) => void;
  applyFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleLegend: () => void;
  setLayouting: (isLayouting: boolean) => void;
  resetView: () => void;
}

const defaultFilters: FilterState = {
  visibleTypes: new Set(['class', 'interface', 'abstract', 'enum']),
  visibleStereotypes: new Set(),
  visiblePackages: new Set(),
  visibleRelationships: new Set(['inheritance', 'realization', 'composition', 'aggregation', 'association', 'dependency']),
  searchQuery: ''
};

export const useUMLDiagramStore = create<UMLDiagramState>((set, get) => ({
  // Initial state
  data: null,
  layoutResult: null,
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  selectedClassIds: new Set(),
  selectedRelationshipIds: new Set(),
  hoveredElement: null,
  tooltipVisible: false,
  tooltipPosition: { x: 0, y: 0 },
  filters: defaultFilters,
  isLayouting: false,
  layoutAlgorithm: 'hierarchical',
  showLegend: false,
  showPackages: true,
  
  // Actions
  setData: (data) => {
    set({ data });
    
    // Update filter options based on available data
    const availableStereotypes = new Set(
      data.classes
        .map(c => c.stereotype)
        .filter(Boolean) as string[]
    );
    
    const availablePackages = new Set(
      data.classes
        .map(c => c.package)
        .filter(Boolean) as string[]
    );
    
    set(state => ({
      filters: {
        ...state.filters,
        visibleStereotypes: availableStereotypes,
        visiblePackages: availablePackages
      }
    }));
  },
  
  setLayoutResult: (result) => set({ layoutResult: result }),
  
  setZoom: (zoom) => {
    // Clamp zoom between 0.1x and 3.0x
    const clampedZoom = Math.max(0.1, Math.min(3.0, zoom));
    set({ zoom: clampedZoom });
  },
  
  setPan: (pan) => set({ pan }),
  
  selectClass: (id, multi) => {
    set(state => {
      const newSelection = new Set(multi ? state.selectedClassIds : []);
      
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      
      return {
        selectedClassIds: newSelection,
        selectedRelationshipIds: new Set() // Clear relationship selection
      };
    });
  },
  
  selectRelationship: (id) => {
    set(state => ({
      selectedRelationshipIds: new Set([id]),
      selectedClassIds: new Set() // Clear class selection
    }));
  },
  
  clearSelection: () => {
    set({
      selectedClassIds: new Set(),
      selectedRelationshipIds: new Set()
    });
  },
  
  setHoveredElement: (element, position) => {
    if (element && position) {
      set({
        hoveredElement: element,
        tooltipVisible: true,
        tooltipPosition: position
      });
    } else {
      set({
        hoveredElement: null,
        tooltipVisible: false
      });
    }
  },
  
  applyFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  resetFilters: () => {
    const { data } = get();
    if (!data) return;
    
    const availableStereotypes = new Set(
      data.classes
        .map(c => c.stereotype)
        .filter(Boolean) as string[]
    );
    
    const availablePackages = new Set(
      data.classes
        .map(c => c.package)
        .filter(Boolean) as string[]
    );
    
    set({
      filters: {
        ...defaultFilters,
        visibleStereotypes: availableStereotypes,
        visiblePackages: availablePackages
      }
    });
  },
  
  toggleLegend: () => {
    set(state => ({ showLegend: !state.showLegend }));
  },
  
  setLayouting: (isLayouting) => set({ isLayouting }),
  
  resetView: () => {
    set({
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      selectedClassIds: new Set(),
      selectedRelationshipIds: new Set()
    });
  }
}));