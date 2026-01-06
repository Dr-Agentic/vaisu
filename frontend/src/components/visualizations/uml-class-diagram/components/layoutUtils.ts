import { getVisibilityConfig, getFontSize } from './ProgressiveDisclosure';

import type { ClassEntity } from '@shared/types';

export const BASE_WIDTH = 200;
export const BASE_HEIGHT = 60; // Name compartment
export const HEADER_HEIGHT = 20;

export interface BoxDimensions {
    width: number;
    height: number;
}

export function calculateClassDimensions(
  classEntity: ClassEntity,
  zoom: number = 1.0,
  collapsed: { attributes: boolean; methods: boolean } = { attributes: false, methods: false },
): BoxDimensions {
  const visibility = getVisibilityConfig(zoom);
  const fontSize = getFontSize(zoom, 12);
  const lineHeight = fontSize + 4;
  const padding = Math.max(4, Math.min(10, zoom * 6));

  let totalHeight = BASE_HEIGHT;

  // Attributes
  const showAttributes = visibility.showAttributes && classEntity.attributes.length > 0;
  if (showAttributes) {
    totalHeight += HEADER_HEIGHT;
    if (!collapsed.attributes) {
      totalHeight += padding * 2 + classEntity.attributes.length * lineHeight;
    }
  }

  // Methods
  const showMethods = visibility.showMethods && classEntity.methods.length > 0;
  if (showMethods) {
    totalHeight += HEADER_HEIGHT;
    if (!collapsed.methods) {
      totalHeight += padding * 2 + classEntity.methods.length * lineHeight;
    }
  }

  return {
    width: BASE_WIDTH,
    height: totalHeight,
  };
}
