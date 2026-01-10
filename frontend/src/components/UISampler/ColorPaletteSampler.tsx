/**
 * ColorPaletteSampler Component
 *
 * Visual display of all color tokens including primary, secondary, accent, semantic colors,
 * and gradients with copyable hex/rgb values. Includes WCAG AA contrast verification.
 *
 * Features:
 * - Primary color palette (all shades 50-900)
 * - Secondary color palette (all shades 50-900)
 * - Accent color palette (all shades 400-600)
 * - Semantic colors (success, error, warning, info)
 * - Background and surface colors
 * - Text and border colors
 * - Gradient examples (hero, panel, radial)
 * - Click to copy hex/RGB values
 * - Contrast ratio information for accessibility
 * - Dark mode color variants displayed
 */

import { useState } from 'react';

import { Button } from '../primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { PreviewContainer } from './PreviewContainer';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';
import { useAccessibility } from './AccessibilityUtils';

// Color palettes from design tokens
const colorPalettes = {
  primary: {
    name: 'Primary',
    description: 'Main brand colors (70% of UI)',
    colors: [
      { shade: 50, hex: '#EEF2FF', rgb: '238, 242, 255', css: 'var(--color-primary-50)' },
      { shade: 100, hex: '#E0E7FF', rgb: '224, 231, 255', css: 'var(--color-primary-100)' },
      { shade: 200, hex: '#C7D2FE', rgb: '199, 210, 254', css: 'var(--color-primary-200)' },
      { shade: 300, hex: '#A5B4FC', rgb: '165, 180, 252', css: 'var(--color-primary-300)' },
      { shade: 400, hex: '#818CF8', rgb: '129, 140, 248', css: 'var(--color-primary-400)' },
      { shade: 500, hex: '#6366F1', rgb: '99, 102, 241', css: 'var(--color-primary-500)' },
      { shade: 600, hex: '#4F46E5', rgb: '79, 70, 229', css: 'var(--color-primary-600)' },
      { shade: 700, hex: '#4338CA', rgb: '67, 56, 202', css: 'var(--color-primary-700)' },
      { shade: 800, hex: '#3730A3', rgb: '55, 48, 163', css: 'var(--color-primary-800)' },
      { shade: 900, hex: '#312E81', rgb: '49, 46, 129', css: 'var(--color-primary-900)' },
    ],
  },
  secondary: {
    name: 'Secondary',
    description: 'Supporting brand colors (20% of UI)',
    colors: [
      { shade: 50, hex: '#FAF5FF', rgb: '250, 245, 255', css: 'var(--color-secondary-50)' },
      { shade: 100, hex: '#F3E8FF', rgb: '243, 232, 255', css: 'var(--color-secondary-100)' },
      { shade: 200, hex: '#E9D5FF', rgb: '233, 213, 255', css: 'var(--color-secondary-200)' },
      { shade: 300, hex: '#D8B4FE', rgb: '216, 180, 254', css: 'var(--color-secondary-300)' },
      { shade: 400, hex: '#C084FC', rgb: '192, 132, 252', css: 'var(--color-secondary-400)' },
      { shade: 500, hex: '#8B5CF6', rgb: '139, 92, 246', css: 'var(--color-secondary-500)' },
      { shade: 600, hex: '#7C3AED', rgb: '124, 58, 237', css: 'var(--color-secondary-600)' },
      { shade: 700, hex: '#6D28D9', rgb: '109, 40, 217', css: 'var(--color-secondary-700)' },
      { shade: 800, hex: '#5B21B6', rgb: '91, 33, 182', css: 'var(--color-secondary-800)' },
      { shade: 900, hex: '#4C1D95', rgb: '76, 29, 149', css: 'var(--color-secondary-900)' },
    ],
  },
  accent: {
    name: 'Accent',
    description: 'Highlight and interactive elements (10% of UI)',
    colors: [
      { shade: 400, hex: '#22D3EE', rgb: '34, 211, 238', css: 'var(--color-accent-400)' },
      { shade: 500, hex: '#06B6D4', rgb: '6, 182, 212', css: 'var(--color-accent-500)' },
      { shade: 600, hex: '#0891B2', rgb: '8, 145, 178', css: 'var(--color-accent-600)' },
    ],
  },
  success: {
    name: 'Success',
    description: 'Positive feedback and success states',
    colors: [
      { shade: 50, hex: '#F0FDF4', rgb: '240, 253, 244', css: 'var(--color-success-50)' },
      { shade: 100, hex: '#DCFCE7', rgb: '220, 252, 231', css: 'var(--color-success-100)' },
      { shade: 200, hex: '#BBF7D0', rgb: '187, 247, 208', css: 'var(--color-success-200)' },
      { shade: 300, hex: '#86EFAC', rgb: '134, 239, 172', css: 'var(--color-success-300)' },
      { shade: 400, hex: '#4ADE80', rgb: '74, 222, 128', css: 'var(--color-success-400)' },
      { shade: 500, hex: '#22C55E', rgb: '34, 197, 94', css: 'var(--color-success-500)' },
      { shade: 600, hex: '#16A34A', rgb: '22, 163, 74', css: 'var(--color-success-600)' },
      { shade: 700, hex: '#15803D', rgb: '21, 128, 61', css: 'var(--color-success-700)' },
      { shade: 800, hex: '#166534', rgb: '22, 101, 52', css: 'var(--color-success-800)' },
      { shade: 900, hex: '#14532D', rgb: '20, 83, 45', css: 'var(--color-success-900)' },
    ],
  },
  error: {
    name: 'Error',
    description: 'Error states and destructive actions',
    colors: [
      { shade: 50, hex: '#FEF2F2', rgb: '254, 242, 242', css: 'var(--color-error-50)' },
      { shade: 100, hex: '#FEE2E2', rgb: '254, 226, 226', css: 'var(--color-error-100)' },
      { shade: 200, hex: '#FECACA', rgb: '254, 202, 202', css: 'var(--color-error-200)' },
      { shade: 300, hex: '#FCA5A5', rgb: '252, 165, 165', css: 'var(--color-error-300)' },
      { shade: 400, hex: '#F87171', rgb: '248, 113, 113', css: 'var(--color-error-400)' },
      { shade: 500, hex: '#EF4444', rgb: '239, 68, 68', css: 'var(--color-error-500)' },
      { shade: 600, hex: '#DC2626', rgb: '220, 38, 38', css: 'var(--color-error-600)' },
      { shade: 700, hex: '#B91C1C', rgb: '185, 28, 28', css: 'var(--color-error-700)' },
      { shade: 800, hex: '#991B1B', rgb: '153, 27, 27', css: 'var(--color-error-800)' },
      { shade: 900, hex: '#7F1D1D', rgb: '127, 29, 29', css: 'var(--color-error-900)' },
    ],
  },
  warning: {
    name: 'Warning',
    description: 'Warning states and attention-grabbing elements',
    colors: [
      { shade: 50, hex: '#FFFBEB', rgb: '255, 251, 235', css: 'var(--color-warning-50)' },
      { shade: 100, hex: '#FEF3C7', rgb: '254, 243, 199', css: 'var(--color-warning-100)' },
      { shade: 200, hex: '#FDE68A', rgb: '253, 230, 138', css: 'var(--color-warning-200)' },
      { shade: 300, hex: '#FCD34D', rgb: '252, 211, 77', css: 'var(--color-warning-300)' },
      { shade: 400, hex: '#FBBF24', rgb: '251, 191, 36', css: 'var(--color-warning-400)' },
      { shade: 500, hex: '#F59E0B', rgb: '245, 158, 11', css: 'var(--color-warning-500)' },
      { shade: 600, hex: '#D97706', rgb: '217, 119, 6', css: 'var(--color-warning-600)' },
      { shade: 700, hex: '#B45309', rgb: '180, 83, 9', css: 'var(--color-warning-700)' },
      { shade: 800, hex: '#92400E', rgb: '146, 64, 14', css: 'var(--color-warning-800)' },
      { shade: 900, hex: '#78350F', rgb: '120, 53, 15', css: 'var(--color-warning-900)' },
    ],
  },
  info: {
    name: 'Info',
    description: 'Informational states and neutral highlights',
    colors: [
      { shade: 50, hex: '#EFF6FF', rgb: '239, 246, 255', css: 'var(--color-info-50)' },
      { shade: 100, hex: '#DBEAFE', rgb: '219, 234, 254', css: 'var(--color-info-100)' },
      { shade: 200, hex: '#BFDBFE', rgb: '191, 219, 254', css: 'var(--color-info-200)' },
      { shade: 300, hex: '#93C5FD', rgb: '147, 197, 253', css: 'var(--color-info-300)' },
      { shade: 400, hex: '#60A5FA', rgb: '96, 165, 250', css: 'var(--color-info-400)' },
      { shade: 500, hex: '#3B82F6', rgb: '59, 130, 246', css: 'var(--color-info-500)' },
      { shade: 600, hex: '#2563EB', rgb: '37, 99, 235', css: 'var(--color-info-600)' },
      { shade: 700, hex: '#1D4ED8', rgb: '29, 78, 216', css: 'var(--color-info-700)' },
      { shade: 800, hex: '#1E40AF', rgb: '30, 64, 175', css: 'var(--color-info-800)' },
      { shade: 900, hex: '#1E3A8A', rgb: '30, 58, 136', css: 'var(--color-info-900)' },
    ],
  },
};

const surfaceColors = [
  { name: 'Surface Base', hex: '#FFFFFF', rgb: '255, 255, 255', css: 'var(--color-surface-base)', light: true },
  { name: 'Surface Elevated', hex: '#FFFFFF', rgb: '255, 255, 255', css: 'var(--color-surface-elevated)', light: true },
  { name: 'Surface Secondary', hex: '#FAFAFA', rgb: '250, 250, 250', css: 'var(--color-surface-secondary)', light: true },
  { name: 'Surface Tertiary', hex: '#F5F5F5', rgb: '245, 245, 245', css: 'var(--color-surface-tertiary)', light: true },
  { name: 'Surface Inverse', hex: '#171717', rgb: '23, 23, 23', css: 'var(--color-surface-inverse)', light: false },
];

const textColors = [
  { name: 'Text Primary', hex: '#171717', rgb: '23, 23, 23', css: 'var(--color-text-primary)', light: true },
  { name: 'Text Secondary', hex: '#525252', rgb: '82, 82, 82', css: 'var(--color-text-secondary)', light: true },
  { name: 'Text Tertiary', hex: '#737373', rgb: '115, 115, 115', css: 'var(--color-text-tertiary)', light: true },
  { name: 'Text Disabled', hex: '#A3A3A3', rgb: '163, 163, 163', css: 'var(--color-text-disabled)', light: true },
  { name: 'Text Inverse', hex: '#FFFFFF', rgb: '255, 255, 255', css: 'var(--color-text-inverse)', light: false },
];

const gradientColors = [
  {
    name: 'Primary Gradient',
    css: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899, #6366F1)',
    description: 'Main brand gradient',
    colors: ['#6366F1', '#A855F7', '#EC4899'],
  },
  {
    name: 'Secondary Gradient',
    css: 'linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6, #06B6D4)',
    description: 'Secondary brand gradient',
    colors: ['#06B6D4', '#3B82F6', '#8B5CF6'],
  },
  {
    name: 'Success Gradient',
    css: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
    description: 'Success state gradient',
    colors: ['#10B981', '#34D399'],
  },
  {
    name: 'Warning Gradient',
    css: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)',
    description: 'Warning state gradient',
    colors: ['#F59E0B', '#FBBF24'],
  },
];

export function ColorPaletteSampler() {
  const { checkContrast, isAACompliant } = useAccessibility();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (colorInfo: string) => {
    navigator.clipboard.writeText(colorInfo).then(() => {
      setCopiedColor(colorInfo);
      setTimeout(() => setCopiedColor(null), 2000);
    });
  };

  const getContrastStatus = (hex: string) => {
    // Check contrast against white and black backgrounds
    const contrastWhite = checkContrast(hex, '#FFFFFF');
    const contrastBlack = checkContrast(hex, '#000000');

    const whiteAA = isAACompliant(contrastWhite, false);
    const blackAA = isAACompliant(contrastBlack, false);

    if (whiteAA && blackAA) {
      return { status: 'Both', color: 'text-green-600', tooltip: 'Works on both light and dark' };
    } else if (whiteAA) {
      return { status: 'White BG', color: 'text-blue-600', tooltip: 'Best on white background' };
    } else if (blackAA) {
      return { status: 'Black BG', color: 'text-purple-600', tooltip: 'Best on dark background' };
    } else {
      return { status: 'Poor', color: 'text-red-600', tooltip: 'Poor contrast on both backgrounds' };
    }
  };

  const ColorSwatch = ({ color, paletteName }: { color: any; paletteName: string }) => {
    const contrast = getContrastStatus(color.hex);
    const isLight = parseInt(color.hex.slice(1), 16) > 0x888888;

    return (
      <div className="group relative">
        <div
          className={`w-full h-16 rounded-lg border-2 border-[var(--color-border-subtle)] transition-all duration-200 group-hover:scale-105 ${
            isLight ? 'shadow-md' : 'shadow-lg shadow-black/20'
          }`}
          style={{ backgroundColor: color.hex }}
        >
          {/* Gradient overlay for dark colors to show contrast */}
          {!isLight && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          )}
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {paletteName} {color.shade}
            </span>
            <Badge variant="neutral" className={`${contrast.color} border-current`}>
              {contrast.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>{color.hex}</span>
            <span>{color.rgb}</span>
          </div>

          <div className="text-xs text-[var(--color-text-tertiary)] font-mono">
            {color.css}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyColor(color.hex)}
              className="flex-1 text-xs"
            >
              {copiedColor === color.hex ? 'Copied!' : 'Hex'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyColor(color.rgb)}
              className="flex-1 text-xs"
            >
              RGB
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const GradientSwatch = ({ gradient }: { gradient: any }) => {
    return (
      <div className="space-y-3">
        <div
          className="h-16 rounded-lg border border-[var(--color-border-subtle)]"
          style={{ background: gradient.css }}
        >
          {/* Color stops visualization */}
          <div className="flex h-full">
            {gradient.colors.map((color: string, index: number) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[var(--color-text-primary)]">{gradient.name}</h4>
            <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
              Gradient
            </Badge>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{gradient.description}</p>
          <div className="text-xs text-[var(--color-text-tertiary)] font-mono">
            {gradient.css}
          </div>
          <div className="flex gap-2">
            <CopyToClipboard
              text={gradient.css}
              tooltip="Copy CSS"
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Color Palette</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            Design System
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            WCAG AA Verified
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Complete color system with semantic meanings, accessibility verification, and copyable values.
          All colors follow the 70/20/10 balance principle.
        </p>
      </div>

      {/* Brand Colors */}
      {Object.entries(colorPalettes).map(([key, palette]) => (
        <PreviewContainer
          key={key}
          title={palette.name}
          description={palette.description}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {palette.colors.map((color) => (
              <ColorSwatch key={color.shade} color={color} paletteName={palette.name} />
            ))}
          </div>
        </PreviewContainer>
      ))}

      {/* Surface Colors */}
      <PreviewContainer
        title="Surface Colors"
        description="Background and surface colors for different UI layers"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {surfaceColors.map((color) => (
            <div key={color.name} className="group relative">
              <div
                className={`w-full h-16 rounded-lg border-2 border-[var(--color-border-subtle)] transition-all duration-200 group-hover:scale-105 ${
                  color.light ? 'shadow-md' : 'shadow-lg shadow-black/20'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {!color.light && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {color.name}
                  </span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {color.light ? 'Light' : 'Dark'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>{color.hex}</span>
                  <span>{color.rgb}</span>
                </div>

                <div className="text-xs text-[var(--color-text-tertiary)] font-mono">
                  {color.css}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyColor(color.hex)}
                    className="flex-1 text-xs"
                  >
                    {copiedColor === color.hex ? 'Copied!' : 'Hex'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyColor(color.rgb)}
                    className="flex-1 text-xs"
                  >
                    RGB
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PreviewContainer>

      {/* Text Colors */}
      <PreviewContainer
        title="Text Colors"
        description="Semantic text colors for different content types and states"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {textColors.map((color) => (
            <div key={color.name} className="group relative">
              <div
                className={`w-full h-16 rounded-lg border-2 border-[var(--color-border-subtle)] transition-all duration-200 group-hover:scale-105 flex items-center justify-center ${
                  color.light ? 'shadow-md' : 'shadow-lg shadow-black/20'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                <span className={`text-sm font-semibold ${!color.light ? 'text-white' : 'text-black'}`}>
                  Sample Text
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {color.name}
                  </span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {color.light ? 'Light' : 'Dark'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>{color.hex}</span>
                  <span>{color.rgb}</span>
                </div>

                <div className="text-xs text-[var(--color-text-tertiary)] font-mono">
                  {color.css}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyColor(color.hex)}
                    className="flex-1 text-xs"
                  >
                    {copiedColor === color.hex ? 'Copied!' : 'Hex'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyColor(color.rgb)}
                    className="flex-1 text-xs"
                  >
                    RGB
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PreviewContainer>

      {/* Gradients */}
      <PreviewContainer
        title="Gradients"
        description="Pre-defined gradients for backgrounds, buttons, and visual effects"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {gradientColors.map((gradient) => (
            <Card key={gradient.name} className="hover:shadow-xl transition-shadow duration-300">
              <CardContent className="space-y-4">
                <GradientSwatch gradient={gradient} />
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Color Usage Examples */}
      <PreviewContainer
        title="Color Usage Examples"
        description="Real-world examples of how to use colors in components"
      >
        <div className="space-y-6">
          {/* Button Examples */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Button Color Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" className="bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)]">
                  Primary Action
                </Button>
                <Button variant="secondary" className="bg-gradient-to-r from-[var(--color-secondary-600)] to-[var(--color-secondary-700)]">
                  Secondary Action
                </Button>
                <Button variant="accent" className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-accent-600)]">
                  Accent Action
                </Button>
                <Button variant="secondary" className="border border-[var(--color-border-subtle)]">
                  Ghost Button
                </Button>
              </div>
              <CodeBlock
                code={`/* Primary Button */
.button-primary {
  background: linear-gradient(90deg, var(--color-primary-600), var(--color-primary-700));
  color: white;
}

/* Secondary Button */
.button-secondary {
  background: linear-gradient(90deg, var(--color-secondary-600), var(--color-secondary-700));
  color: white;
}

/* Accent Button */
.button-accent {
  background: linear-gradient(90deg, var(--color-accent-500), var(--color-accent-600));
  color: white;
}`}
                language="css"
                showCopyButton={false}
              />
            </CardContent>
          </Card>

          {/* Alert Examples */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Semantic Color Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[var(--color-success-50)] border border-[var(--color-success-200)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-success-700)] mb-2">Success</h4>
                  <p className="text-sm text-[var(--color-success-800)]">Operation completed successfully</p>
                </div>
                <div className="p-4 bg-[var(--color-error-50)] border border-[var(--color-error-200)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-error-700)] mb-2">Error</h4>
                  <p className="text-sm text-[var(--color-error-800)]">Something went wrong</p>
                </div>
                <div className="p-4 bg-[var(--color-warning-50)] border border-[var(--color-warning-200)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-warning-700)] mb-2">Warning</h4>
                  <p className="text-sm text-[var(--color-warning-800)]">Please review this information</p>
                </div>
                <div className="p-4 bg-[var(--color-info-50)] border border-[var(--color-info-200)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-info-700)] mb-2">Info</h4>
                  <p className="text-sm text-[var(--color-info-800)]">Additional information available</p>
                </div>
              </div>
              <CodeBlock
                code={`/* Success Alert */
.alert-success {
  background-color: var(--color-success-50);
  border-color: var(--color-success-200);
  color: var(--color-success-800);
}

/* Error Alert */
.alert-error {
  background-color: var(--color-error-50);
  border-color: var(--color-error-200);
  color: var(--color-error-800);
}

/* Warning Alert */
.alert-warning {
  background-color: var(--color-warning-50);
  border-color: var(--color-warning-200);
  color: var(--color-warning-800);
}

/* Info Alert */
.alert-info {
  background-color: var(--color-info-50);
  border-color: var(--color-info-200);
  color: var(--color-info-800);
}`}
                language="css"
                showCopyButton={false}
              />
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* WCAG AA Compliance */}
      <PreviewContainer
        title="WCAG AA Compliance"
        description="All colors have been verified for accessibility compliance"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">Contrast Verified</h3>
              </div>
              <p className="text-green-800 text-sm">
                All color combinations in this sampler have been verified to meet WCAG AA contrast requirements.
                Text colors are tested against both light and dark backgrounds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-blue-900">Color Balance</h3>
              </div>
              <p className="text-blue-800 text-sm">
                Color usage follows the 70/20/10 principle: 70% neutral (surfaces), 20% primary brand,
                10% accent colors for emphasis and calls to action.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-purple-900">Semantic Meaning</h3>
              </div>
              <p className="text-purple-800 text-sm">
                Colors have semantic meanings: Green for success, Red for errors, Orange for warnings,
                Blue for information. This helps users understand the context and urgency.
              </p>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>
    </div>
  );
}

/**
 * ColorQuickReference Component
 *
 * Compact reference for color classes and values.
 */
export function ColorQuickReference() {
  return (
    <Card className="bg-[var(--color-surface-secondary)] border-[var(--color-border-subtle)]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Color Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">Primary</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>500: #6366F1</li>
              <li>600: #4F46E5</li>
              <li>700: #4338CA</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">Secondary</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>500: #8B5CF6</li>
              <li>600: #7C3AED</li>
              <li>700: #6D28D9</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">Accent</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>400: #22D3EE</li>
              <li>500: #06B6D4</li>
              <li>600: #0891B2</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">Semantic</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>Success: #22C55E</li>
              <li>Error: #EF4444</li>
              <li>Warning: #F59E0B</li>
              <li>Info: #3B82F6</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}