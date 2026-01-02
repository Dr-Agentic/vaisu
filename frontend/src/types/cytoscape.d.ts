// Cytoscape.js TypeScript type definitions
// These types provide better IntelliSense and type safety for Cytoscape.js usage

declare module 'cytoscape' {
  export interface ElementDefinition {
    group?: 'nodes' | 'edges';
    data: {
      id: string;
      [key: string]: any;
    };
    position?: {
      x: number;
      y: number;
    };
    selected?: boolean;
    selectable?: boolean;
    locked?: boolean;
    grabbable?: boolean;
    pannable?: boolean;
    classes?: string | string[];
  }

  export interface NodeDefinition extends ElementDefinition {
    group: 'nodes';
    data: {
      id: string;
      [key: string]: any;
    };
  }

  export interface EdgeDefinition extends ElementDefinition {
    group: 'edges';
    data: {
      id: string;
      source: string;
      target: string;
      [key: string]: any;
    };
  }

  export interface Collection {
    nodes(): Collection;
    edges(): Collection;
    filter(filter: (element: any) => boolean): Collection;
    forEach(callback: (element: any) => void): void;
    hide(): void;
    show(): void;
    data(key?: string, value?: any): any;
    position(): { x: number; y: number } | void;
    select(): void;
    unselect(): void;
    animate(animation: any, options?: any): void;
    length: number;
    [index: number]: any;
  }

  export interface LayoutOptions {
    name: string;
    elk?: {
      algorithm?: string;
      [key: string]: any;
    };
    ready?: () => void;
    stop?: () => void;
    animate?: boolean;
    animationDuration?: number;
  }

  export interface StyleDefinition {
    selector: string;
    style: {
      [key: string]: any;
    };
  }

  export interface CytoscapeOptions {
    container: HTMLElement | null;
    elements: (NodeDefinition | EdgeDefinition)[];
    style?: StyleDefinition[];
    wheelSensitivity?: number;
    minZoom?: number;
    maxZoom?: number;
    zoomingEnabled?: boolean;
    userZoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    selectionType?: 'single' | 'multiple';
    touchTapThreshold?: number;
    desktopTapThreshold?: number;
    autolock?: boolean;
    autoungrabify?: boolean;
    autounselectify?: boolean;
  }

  export interface CytoscapeCore {
    nodes(): Collection;
    edges(): Collection;
    elements(): Collection;
    add(elements: (NodeDefinition | EdgeDefinition)[]): Collection;
    remove(elements: Collection | string): Collection;
    style(styles: StyleDefinition[]): void;
    layout(options: LayoutOptions): any;
    on(events: string, selector: string, callback: (event: any) => void): void;
    off(events: string, selector: string, callback?: (event: any) => void): void;
    animate(animation: any, options?: any): void;
    center(elements?: Collection | string): void;
    fit(elements?: Collection | string): void;
    resize(): void;
    destroy(): void;
    zoom(level?: number, position?: { x: number; y: number }): number;
  }

  function cytoscape(options: CytoscapeOptions): CytoscapeCore;
  export default cytoscape;
}

declare module 'cytoscape-elk' {
  import cytoscape from 'cytoscape';

  function elk(cytoscape: typeof cytoscape): void;
  export default elk;
}