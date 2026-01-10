/**
 * TooltipSampler Component
 *
 * Interactive examples showing all Tooltip component variants, positions, and states.
 * Demonstrates accessibility features and positioning options.
 *
 * Features:
 * - All positions: top, bottom, left, right
 * - All states: default, hover, focus, interactive
 * - With different content types (text, icons, complex content)
 * - Interactive tooltips with form elements
 * - Copyable code for each variation
 * - Keyboard navigation testing (Tab, Esc)
 * - Focus management and trap
 * - WCAG AA compliant with proper ARIA attributes
 */

import { useState } from 'react';

import { Tooltip } from '../primitives/Tooltip';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Input } from '../primitives/Input';
import { PreviewContainer } from './PreviewContainer';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';

export function TooltipSampler() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Tooltip examples with their properties
  const tooltipExamples = [
    {
      title: 'Top Position',
      description: 'Tooltip positioned above the trigger element',
      code: `<Tooltip content="This tooltip appears at the top" position="top">
    <button>Hover me</button>
  </Tooltip>`,
      component: (
        <Tooltip content="This tooltip appears at the top" position="top">
          <Button variant="primary">Top Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'Bottom Position',
      description: 'Tooltip positioned below the trigger element',
      code: `<Tooltip content="This tooltip appears at the bottom" position="bottom">
    <button>Hover me</button>
  </Tooltip>`,
      component: (
        <Tooltip content="This tooltip appears at the bottom" position="bottom">
          <Button variant="secondary">Bottom Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'Left Position',
      description: 'Tooltip positioned to the left of the trigger element',
      code: `<Tooltip content="This tooltip appears on the left" position="left">
    <button>Hover me</button>
  </Tooltip>`,
      component: (
        <Tooltip content="This tooltip appears on the left" position="left">
          <Button variant="accent">Left Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'Right Position',
      description: 'Tooltip positioned to the right of the trigger element',
      code: `<Tooltip content="This tooltip appears on the right" position="right">
    <button>Hover me</button>
  </Tooltip>`,
      component: (
        <Tooltip content="This tooltip appears on the right" position="right">
          <Button variant="ghost">Right Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'Interactive Tooltip',
      description: 'Tooltip with interactive content',
      code: `<Tooltip content={<div>Interactive content<div><input /></div></div>}>
    <button>Interactive tooltip</button>
  </Tooltip>`,
      component: (
        <Tooltip
          content={
            <div className="p-3 bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg space-y-2">
              <h4 className="font-semibold text-[var(--color-text-primary)]">Interactive Content</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">This tooltip contains interactive elements.</p>
              <Input
                placeholder="Type here..."
                size="sm"
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <Button variant="primary" size="sm">Submit</Button>
                <Button variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          }
        >
          <Button variant="aurora">Interactive Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'With Icon',
      description: 'Tooltip triggered by an icon button',
      code: `<Tooltip content="Help text" position="top">
    <button><Icon /></button>
  </Tooltip>`,
      component: (
        <div className="flex items-center gap-4">
          <Tooltip content="This is a help icon with tooltip" position="top">
            <Button variant="ghost" size="sm" className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Information about this feature" position="bottom">
            <Button variant="ghost" size="sm" className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Warning: Proceed with caution" position="left">
            <Button variant="ghost" size="sm" className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.364 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </Button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Complex Content',
      description: 'Tooltip with rich content including lists and formatting',
      code: `<Tooltip content={
    <div>
      <h4>Title</h4>
      <ul><li>Item 1</li><li>Item 2</li></ul>
    </div>
  }>
    <button>Complex tooltip</button>
  </Tooltip>`,
      component: (
        <Tooltip
          content={
            <div className="p-3 bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg max-w-sm">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Feature Details</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">This feature provides advanced functionality for power users.</p>
              <ul className="list-disc list-inside text-sm text-[var(--color-text-secondary)] space-y-1 mb-3">
                <li>Advanced configuration options</li>
                <li>Customizable workflows</li>
                <li>Integration capabilities</li>
                <li>Real-time collaboration</li>
              </ul>
              <div className="flex gap-2">
                <Badge variant="primary">New</Badge>
                <Badge variant="success">Available</Badge>
              </div>
            </div>
          }
        >
          <Button variant="nova">Complex Content Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'Long Text Tooltip',
      description: 'Tooltip with longer text content that wraps properly',
      code: `<Tooltip content="This is a very long tooltip text that will wrap to multiple lines when it exceeds the maximum width. It demonstrates how long content is handled within the tooltip container.">
    <button>Long tooltip</button>
  </Tooltip>`,
      component: (
        <Tooltip content="This is a very long tooltip text that will wrap to multiple lines when it exceeds the maximum width. It demonstrates how long content is handled within the tooltip container and maintains proper readability.">
          <Button variant="gradient-primary">Long Text Tooltip</Button>
        </Tooltip>
      ),
    },
    {
      title: 'Trigger Events',
      description: 'Different ways to trigger tooltips',
      code: `// Hover (default)
  <Tooltip content="Hover tooltip">
    <button>Hover me</button>
  </Tooltip>

  // Focus
  <Tooltip content="Focus tooltip" showOnFocus={true}>
    <button>Focus me</button>
  </Tooltip>

  // Manual control (custom implementation)
  <div>
    <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      Custom trigger
    </button>
  </div>`,
      component: (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Tooltip content="This appears on hover (default)" position="top">
              <Button variant="primary">Hover Trigger</Button>
            </Tooltip>
            <Tooltip content="This appears on focus" position="top" showOnFocus={true}>
              <Button variant="secondary">Focus Trigger</Button>
            </Tooltip>
          </div>
          <div className="flex gap-4">
            <Tooltip
              content="This is manually controlled"
              position="bottom"
            >
              <Button
                variant="accent"
                onMouseEnter={() => setActiveTooltip('manual')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                Manual Control
              </Button>
            </Tooltip>
            <Tooltip
              content="Click to toggle"
              position="bottom"
            >
              <Button
                variant="ghost"
                onClick={() => setActiveTooltip(activeTooltip === 'click' ? null : 'click')}
              >
                Click Toggle
              </Button>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Accessibility Demo',
      description: 'Tooltip with proper accessibility attributes and keyboard support',
      code: `<Tooltip content="Accessible tooltip with proper ARIA attributes" position="top">
    <button aria-label="Button with tooltip">Accessible</button>
  </Tooltip>`,
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tooltip content="This button has a clear purpose and accessible tooltip" position="top">
              <Button variant="primary" aria-label="Save current changes">
                Save Changes
              </Button>
            </Tooltip>
            <Tooltip content="This button resets the form to its initial state" position="bottom">
              <Button variant="danger" aria-label="Reset form to defaults">
                Reset Form
              </Button>
            </Tooltip>
            <Tooltip content="This button opens the help documentation" position="right">
              <Button variant="ghost" aria-label="Open help documentation">
                Help
              </Button>
            </Tooltip>
          </div>
          <div className="text-sm text-[var(--color-text-secondary)]">
            <p>Tip: Use Tab to navigate between buttons and see how tooltips work with keyboard navigation.</p>
            <p>Each button has proper aria-label for screen reader support.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Tooltip Components</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            All Variants
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            Interactive
          </Badge>
          <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            10 Examples
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Complete Tooltip component examples showing all positions, states, and accessibility features.
          All tooltips include proper ARIA attributes and keyboard navigation support.
        </p>
      </div>

      {/* Live Demo */}
      <PreviewContainer
        title="Live Tooltip Demo"
        description="Interactive tooltip examples with different positions and content types"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tooltipExamples.map((example, index) => (
            <div key={index} className="space-y-4">
              <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{example.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">{example.description}</p>
                <div className="flex justify-center">
                  {example.component}
                </div>
              </div>
              <div className="text-sm text-[var(--color-text-tertiary)] font-mono bg-[var(--color-surface-secondary)] p-3 rounded-lg">
                {example.code.replace(/<Tooltip[\s\S]*?>[\s\S]*?<\/Tooltip>/, '<Tooltip>...</Tooltip>')}
              </div>
            </div>
          ))}
        </div>
      </PreviewContainer>

      {/* Position Guide */}
      <PreviewContainer
        title="Position Guide"
        description="Four positioning options: top, bottom, left, and right"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">When to Use Each Position</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-success-100)] text-[var(--color-success-800)]">
                    Top
                  </Badge>
                  <span>Above the trigger element, good for important information</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]">
                    Bottom
                  </Badge>
                  <span>Below the trigger element, most common position</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]">
                    Left
                  </Badge>
                  <span>To the left of trigger, good for narrow elements</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-warning-100)] text-[var(--color-warning-800)]">
                    Right
                  </Badge>
                  <span>To the right of trigger, good for wide elements</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">Position Specifications</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Top</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">position="top"</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Bottom</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">position="bottom"</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Left</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">position="left"</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Right</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">position="right"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* Interactive Features */}
      <PreviewContainer
        title="Interactive Features"
        description="Tooltips can contain interactive content and respond to different triggers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-green-900">Interactive Content</h4>
            </div>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Tooltips can contain form elements</li>
              <li>• Content remains interactive when tooltip is open</li>
              <li>• Supports complex layouts and components</li>
              <li>• Maintains accessibility for all interactive elements</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-blue-900">Trigger Events</h4>
            </div>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• hover: Mouse hover (default)</li>
              <li>• focus: Keyboard focus</li>
              <li>• manual: Programmatic control</li>
              <li>• click: Click to toggle</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h4 className="font-semibold text-purple-900">Content Types</h4>
            </div>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Simple text strings</li>
              <li>• React components</li>
              <li>• Form elements</li>
              <li>• Rich content with formatting</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-yellow-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h4 className="font-semibold text-yellow-900">Accessibility</h4>
            </div>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Proper ARIA attributes</li>
              <li>• Keyboard navigation support</li>
              <li>• Screen reader compatibility</li>
              <li>• Focus management</li>
            </ul>
          </div>
        </div>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
        description="Tooltips include proper ARIA attributes and keyboard navigation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-green-900">ARIA Support</h4>
            </div>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• role="tooltip" for screen readers</li>
              <li>• aria-describedby for trigger elements</li>
              <li>• Proper labeling for context</li>
              <li>• Clear content hierarchy</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-blue-900">Keyboard Navigation</h4>
            </div>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Tab navigation through elements</li>
              <li>• Focus triggers tooltips</li>
              <li>• Esc key closes tooltips</li>
              <li>• Proper focus management</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h4 className="font-semibold text-purple-900">Focus Management</h4>
            </div>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Focus remains on trigger</li>
              <li>• Interactive content receives focus</li>
              <li>• Proper focus return on close</li>
              <li>• No focus trap unless interactive</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-yellow-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h4 className="font-semibold text-yellow-900">Screen Reader</h4>
            </div>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Tooltip content announced</li>
              <li>• Clear context provided</li>
              <li>• Proper timing for announcements</li>
              <li>• Non-intrusive for users</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-cyan-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <h4 className="font-semibold text-cyan-900">Visual Indicators</h4>
            </div>
            <ul className="text-cyan-800 text-sm space-y-1">
              <li>• Clear positioning</li>
              <li>• Arrow indicators</li>
              <li>• Proper z-index stacking</li>
              <li>• Smooth animations</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-indigo-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <h4 className="font-semibold text-indigo-900">Touch Support</h4>
            </div>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Touch-friendly interactions</li>
              <li>• Proper timing for mobile</li>
              <li>• Gesture support</li>
              <li>• Mobile responsive</li>
            </ul>
          </div>
        </div>
      </PreviewContainer>

      {/* Usage Guidelines */}
      <PreviewContainer
        title="Usage Guidelines"
        description="Best practices for implementing tooltips in your application"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">When to Use Tooltips</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Additional Information:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    When you need to provide extra context or explanation for UI elements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Form Guidance:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    When explaining form fields or providing input hints.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Icon Clarification:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    When icons need textual explanation for clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">When NOT to Use Tooltips</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Primary Information:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Important information should be visible without requiring interaction.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Long Text:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Tooltips are not suitable for long paragraphs or detailed explanations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Critical Actions:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Don't hide critical information behind tooltips.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border-subtle)] mt-6 pt-6">
          <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">Accessibility Checklist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium text-[var(--color-text-secondary)]">Content</h5>
              <ul className="text-[var(--color-text-tertiary)] space-y-1">
                <li>• Keep content concise</li>
                <li>• Use clear, descriptive text</li>
                <li>• Avoid jargon or abbreviations</li>
                <li>• Provide context</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-[var(--color-text-secondary)]">Timing</h5>
              <ul className="text-[var(--color-text-tertiary)] space-y-1">
                <li>• Delay before showing</li>
                <li>• Delay before hiding</li>
                <li>• Respect user preferences</li>
                <li>• Allow dismissal</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-[var(--color-text-secondary)]">Positioning</h5>
              <ul className="text-[var(--color-text-tertiary)] space-y-1">
                <li>• Don't obscure content</li>
                <li>• Consider screen size</li>
                <li>• Use appropriate position</li>
                <li>• Handle overflow</li>
              </ul>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* Component API */}
      <PreviewContainer
        title="Component API"
        description="Tooltip component props and configuration options"
      >
        <div className="border border-[var(--color-border-subtle)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Props</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">content</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">string | ReactNode</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">position</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">top | bottom | left | right</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">delay</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">number (default: 300)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">showOnFocus</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">boolean (default: true)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">className</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Features</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">ARIA Support</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">role="tooltip"</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Keyboard Navigation</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Focus + Hover</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Positioning</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Auto-adjust</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Animations</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Fade-in</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Interactive Content</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Supported</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* Interactive Demo */}
      <PreviewContainer
        title="Interactive Demo"
        description="Test different tooltip configurations and see accessibility features in action"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Trigger Events</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Try hovering over these buttons to see different trigger behaviors.
            </p>
            <div className="space-y-2">
              <Tooltip content="This appears on hover" position="top">
                <Button variant="primary" fullWidth>Hover Trigger</Button>
              </Tooltip>
              <Tooltip content="This appears on focus" position="bottom">
                <Button variant="secondary" fullWidth>Focus Trigger</Button>
              </Tooltip>
              <Tooltip content="This is interactive" position="left">
                <Button variant="accent" fullWidth>Interactive</Button>
              </Tooltip>
            </div>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Position Testing</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Test all four positions and see how they adapt to content.
            </p>
            <div className="space-y-2">
              <Tooltip content="Top position tooltip" position="top">
                <Button variant="ghost" fullWidth>Top</Button>
              </Tooltip>
              <Tooltip content="Bottom position tooltip" position="bottom">
                <Button variant="ghost" fullWidth>Bottom</Button>
              </Tooltip>
              <Tooltip content="Left position tooltip" position="left">
                <Button variant="ghost" fullWidth>Left</Button>
              </Tooltip>
              <Tooltip content="Right position tooltip" position="right">
                <Button variant="ghost" fullWidth>Right</Button>
              </Tooltip>
            </div>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Accessibility</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Use Tab to navigate and test keyboard accessibility.
            </p>
            <div className="space-y-2">
              <Tooltip content="Keyboard accessible tooltip" position="top">
                <Button variant="aurora" fullWidth>Tab Navigation</Button>
              </Tooltip>
              <Tooltip content="Screen reader friendly" position="bottom">
                <Button variant="nova" fullWidth>Screen Reader</Button>
              </Tooltip>
              <Tooltip content="Focus management demo" position="right">
                <Button variant="gradient-primary" fullWidth>Focus Demo</Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </PreviewContainer>
    </div>
  );
}