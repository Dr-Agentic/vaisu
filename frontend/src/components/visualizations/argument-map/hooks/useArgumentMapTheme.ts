import { useMemo } from 'react';
import { useTheme } from '@/design-system/ThemeProvider';
import { EntityType, RelationshipType } from '../types';

interface NodeTypeColorScheme {
  background: string;
  border: string;
  glow?: string;
  text: string;
}

export const useArgumentMapTheme = () => {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // Dark Mode "Void" Theme
  const darkTheme = useMemo(() => ({
    background: {
      primary: '#0a0f1f',
      secondary: '#1a1f33',
      accent: '#2a3357'
    },

    nodeTypes: {
      CLAIM: {
        background: 'rgba(0, 191, 255, 0.1)',
        border: 'rgba(0, 191, 255, 0.8)',
        glow: '0 0 20px rgba(0, 191, 255, 0.3)',
        text: '#e6f3ff'
      },
      EVIDENCE: {
        background: 'rgba(255, 165, 0, 0.1)',
        border: 'rgba(255, 165, 0, 0.8)',
        glow: '0 0 15px rgba(255, 165, 0, 0.4)',
        text: '#fff3e0'
      },
      CONCLUSION: {
        background: 'rgba(138, 43, 226, 0.1)',
        border: 'rgba(138, 43, 226, 0.9)',
        glow: '0 0 25px rgba(138, 43, 226, 0.4)',
        text: '#f3e5f5'
      }
    },

    connections: {
      SUPPORTS: 'rgba(0, 255, 200, 0.6)',
      CONTRADICTS: 'rgba(255, 50, 50, 0.6)',
      ELABORATES: 'rgba(100, 200, 255, 0.5)',
      DEPENDS_ON: 'rgba(255, 215, 0, 0.6)'
    },

    interface: {
      textPrimary: '#e6e6e6',
      textSecondary: '#a6a6a6',
      textMuted: '#666666',
      border: '#334155',
      hover: 'rgba(255, 255, 255, 0.1)'
    },

    effects: {
      hover: {
        node: 'scale(1.1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
        edge: 'glow(0 0 15px rgba(255, 255, 255, 0.8))'
      },
      selection: {
        node: 'ring-4 ring-white ring-opacity-50',
        edge: 'filter: brightness(1.5)'
      }
    }
  }), []);

  // Light Mode "Lab" Theme
  const lightTheme = useMemo(() => ({
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#e2e8f0'
    },

    nodeTypes: {
      CLAIM: {
        background: '#eff6ff',
        border: '#1d4ed8',
        shadow: '0 4px 6px -1px rgba(30, 58, 138, 0.1)',
        text: '#1e3a8a'
      },
      EVIDENCE: {
        background: '#f0fdf4',
        border: '#166534',
        shadow: '0 4px 6px -1px rgba(22, 101, 52, 0.1)',
        text: '#14532d'
      },
      CONCLUSION: {
        background: '#fef2f2',
        border: '#dc2626',
        shadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)',
        text: '#991b1b'
      }
    },

    connections: {
      SUPPORTS: '#059669',
      CONTRADICTS: '#dc2626',
      ELABORATES: '#2563eb',
      DEPENDS_ON: '#d97706'
    },

    interface: {
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      hover: 'rgba(0, 0, 0, 0.05)'
    },

    effects: {
      hover: {
        node: 'scale(1.05) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15))',
        edge: 'brightness(1.2) saturate(1.1)'
      },
      selection: {
        node: 'ring-3 ring-blue-500',
        edge: 'filter: saturate(1.5)'
      }
    }
  }), []);

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  const getNodeTypeColor = (type: EntityType): NodeTypeColorScheme => {
    return currentTheme.nodeTypes[type];
  };

  const getConnectionColor = (type: RelationshipType): string => {
    return currentTheme.connections[type];
  };

  const getNodeSize = (node: any): number => {
    const baseSize = theme === 'dark' ? 8 : 6;
    const confidenceMultiplier = 1 + (node.confidence || 0.5);
    return baseSize * confidenceMultiplier;
  };

  const getEdgeStyle = (edgeType: RelationshipType) => {
    const baseStyles = {
      SUPPORTS: { curve: 0.3, width: 2, opacity: 0.8, dashArray: 'none' },
      CONTRADICTS: { curve: 0.5, width: 3, opacity: 0.9, dashArray: '5,5' },
      ELABORATES: { curve: 0, width: 1, opacity: 0.6, dashArray: '2,4' },
      DEPENDS_ON: { curve: 0.2, width: 2, opacity: 0.7, dashArray: 'none' }
    };

    return baseStyles[edgeType];
  };

  const getInteractionStyles = (isHovered: boolean, isSelected: boolean) => {
    if (isSelected) {
      return {
        transform: 'scale(1.05)',
        boxShadow: currentTheme.effects.selection.node,
        zIndex: 10
      };
    } else if (isHovered) {
      return {
        transform: 'scale(1.1)',
        boxShadow: currentTheme.effects.hover.node,
        zIndex: 5
      };
    }

    return {
      transform: 'scale(1)',
      boxShadow: 'none',
      zIndex: 1
    };
  };

  return {
    theme,
    colors: currentTheme,
    getNodeTypeColor,
    getConnectionColor,
    getNodeSize,
    getEdgeStyle,
    getInteractionStyles,
    isDarkMode: theme === 'dark'
  };
};