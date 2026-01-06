import { Layers, Globe, Box, Cpu, User, FileText, HelpCircle } from 'lucide-react';

import { GraphThemeColor } from './types';

/**
 * Maps entity types to specific Lucide React icons.
 */
export const getTypeIcon = (type: string) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes('concept') || normalizedType.includes('layer')) return Layers;
  if (normalizedType.includes('org') || normalizedType.includes('network')) return Globe;
  if (normalizedType.includes('product') || normalizedType.includes('object')) return Box;
  if (normalizedType.includes('tech') || normalizedType.includes('system')) return Cpu;
  if (normalizedType.includes('person') || normalizedType.includes('user')) return User;
  if (normalizedType.includes('doc') || normalizedType.includes('file')) return FileText;

  return HelpCircle;
};

/**
 * Maps entity types to specific Tailwind color themes.
 * Returns generic color classes that work with the design system.
 */
export const getTypeColor = (type: string): GraphThemeColor => {
  const normalizedType = type.toLowerCase();

  // Purple for Concepts
  if (normalizedType.includes('concept') || normalizedType.includes('layer')) {
    return {
      background: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
    };
  }

  // Blue for Organizations
  if (normalizedType.includes('org') || normalizedType.includes('network')) {
    return {
      background: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
    };
  }

  // Orange for Products
  if (normalizedType.includes('product') || normalizedType.includes('object')) {
    return {
      background: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400',
    };
  }

  // Slate for Technology
  if (normalizedType.includes('tech') || normalizedType.includes('system')) {
    return {
      background: 'bg-slate-50 dark:bg-slate-900/20',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-800',
      icon: 'text-slate-600 dark:text-slate-400',
    };
  }

  // Green for People
  if (normalizedType.includes('person') || normalizedType.includes('user')) {
    return {
      background: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
    };
  }

  // Default Gray
  return {
    background: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
  };
};

/**
 * Recursively unwraps DynamoDB JSON format.
 */
export const unwrapDynamo = (item: any): any => {
  if (!item || typeof item !== 'object') {
    return item;
  }

  if (Array.isArray(item)) {
    return item.map(unwrapDynamo);
  }

  // Handle DynamoDB Types
  if (item.S !== undefined) return item.S;
  if (item.N !== undefined) return Number(item.N);
  if (item.BOOL !== undefined) return item.BOOL;
  if (item.NULL !== undefined) return null;
  if (item.M !== undefined) return unwrapDynamo(item.M);
  if (item.L !== undefined) return unwrapDynamo(item.L);

  // Handle regular objects
  const result: any = {};
  for (const key in item) {
    result[key] = unwrapDynamo(item[key]);
  }
  return result;
};
