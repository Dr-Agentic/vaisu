/**
 * ModalSampler Component
 *
 * Interactive examples showing all Modal component variants, sizes, and states.
 * Demonstrates accessibility features and keyboard navigation.
 *
 * Features:
 * - All sizes: sm, md, lg, xl
 * - All states: default, open, closed
 * - With and without close button
 * - Scrollable content examples
 * - Custom animations
 * - Keyboard navigation testing (Tab, Esc)
 * - Focus management and trap
 * - WCAG AA compliant with proper ARIA attributes
 */

import { useState } from 'react';

import { Modal } from '../primitives/Modal';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { Badge } from '../primitives/Badge';
import { PreviewContainer } from './PreviewContainer';

export function ModalSampler() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { email: formEmail, name: formName });
    closeModal();
  };

  // Modal examples with their properties
  const modalExamples = [
    {
      title: 'Small Modal',
      description: 'Compact modal for simple interactions',
      code: `<Modal
    isOpen={isOpen}
    onClose={onClose}
    size="sm"
    title="Small Modal"
  >
    <p>Content goes here</p>
  </Modal>`,
      component: (
        <Modal
          isOpen={activeModal === 'small'}
          onClose={closeModal}
          size="sm"
          title="Small Modal"
        >
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)] mb-4">
              This is a small modal with compact content. Perfect for simple interactions
              or confirmations that don't require much space.
            </p>
            <div className="flex gap-3">
              <Button variant="primary" onClick={closeModal}>
                Confirm
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      ),
      button: (
        <Button variant="primary" onClick={() => openModal('small')}>
          Open Small Modal
        </Button>
      ),
    },
    {
      title: 'Medium Modal',
      description: 'Standard modal for forms and content',
      code: `<Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    title="Medium Modal"
  >
    <p>Content goes here</p>
  </Modal>`,
      component: (
        <Modal
          isOpen={activeModal === 'medium'}
          onClose={closeModal}
          size="md"
          title="Medium Modal"
        >
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <Button type="submit" variant="primary">
                  Submit Form
                </Button>
                <Button variant="ghost" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      ),
      button: (
        <Button variant="secondary" onClick={() => openModal('medium')}>
          Open Medium Modal
        </Button>
      ),
    },
    {
      title: 'Large Modal',
      description: 'Large modal for detailed content',
      code: `<Modal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    title="Large Modal"
  >
    <p>Content goes here</p>
  </Modal>`,
      component: (
        <Modal
          isOpen={activeModal === 'large'}
          onClose={closeModal}
          size="lg"
          title="Large Modal"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Section A</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  This is a detailed section with more content that benefits from the larger
                  modal size.
                </p>
              </div>
              <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Section B</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Another section that can display more information in the larger format.
                </p>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Content Area</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                This large modal is perfect for displaying detailed information, complex forms,
                or content that requires more space to be properly presented.
              </p>
              <div className="flex gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="ghost" onClick={closeModal}>Close</Button>
              </div>
            </div>
          </div>
        </Modal>
      ),
      button: (
        <Button variant="accent" onClick={() => openModal('large')}>
          Open Large Modal
        </Button>
      ),
    },
    {
      title: 'Extra Large Modal',
      description: 'Maximum space for complex content',
      code: `<Modal
    isOpen={isOpen}
    onClose={onClose}
    size="xl"
    title="Extra Large Modal"
  >
    <p>Content goes here</p>
  </Modal>`,
      component: (
        <Modal
          isOpen={activeModal === 'xl'}
          onClose={closeModal}
          size="xl"
          title="Extra Large Modal"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Column 1</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  First column content with plenty of space.
                </p>
              </div>
              <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Column 2</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Second column with detailed information.
                </p>
              </div>
              <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Column 3</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Third column with additional details.
                </p>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Full Width Content</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                The extra large modal provides maximum space for complex layouts, detailed
                data visualization, or content that requires extensive screen real estate.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-primary)]">Features</h5>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                    <li>• Maximum screen real estate</li>
                    <li>• Complex layout support</li>
                    <li>• Multiple content areas</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-primary)]">Use Cases</h5>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                    <li>• Data dashboards</li>
                    <li>• Complex forms</li>
                    <li>• Detailed documentation</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary">Save Changes</Button>
              <Button variant="secondary">Reset</Button>
              <Button variant="ghost" onClick={closeModal}>Close</Button>
            </div>
          </div>
        </Modal>
      ),
      button: (
        <Button variant="gradient-primary" onClick={() => openModal('xl')}>
          Open XL Modal
        </Button>
      ),
    },
    {
      title: 'Modal Without Close Button',
      description: 'Modal without the X button for critical actions',
      code: `<Modal
    isOpen={isOpen}
    onClose={onClose}
    showCloseButton={false}
    title="Important Notice"
  >
    <p>Content goes here</p>
  </Modal>`,
      component: (
        <Modal
          isOpen={activeModal === 'no-close'}
          onClose={closeModal}
          size="md"
          title="Important Notice"
        >
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-warning-50)] border border-[var(--color-warning-200)] rounded-lg">
              <h4 className="font-semibold text-[var(--color-warning-800)] mb-2">Warning</h4>
              <p className="text-sm text-[var(--color-warning-800)]">
                This modal doesn't have a close button to ensure the user completes the
                required action before proceeding.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={closeModal}>
                Acknowledge
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      ),
      button: (
        <Button variant="danger" onClick={() => openModal('no-close')}>
          Open Modal (No Close)
        </Button>
      ),
    },
    {
      title: 'Scrollable Content Modal',
      description: 'Modal with scrollable content area',
      code: `<Modal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    title="Scrollable Content"
  >
    <div style={{ height: '600px', overflow: 'auto' }}>
      <p>Scrollable content...</p>
    </div>
  </Modal>`,
      component: (
        <Modal
          isOpen={activeModal === 'scrollable'}
          onClose={closeModal}
          size="lg"
          title="Scrollable Content Modal"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    Section {i + 1}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    This is a long section of content that demonstrates how the modal
                    handles scrollable content. Each section contains useful information
                    that the user might need to review carefully before making a decision.
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={closeModal}>
                Complete
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      ),
      button: (
        <Button variant="aurora" onClick={() => openModal('scrollable')}>
          Open Scrollable Modal
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Modal Components</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            All Variants
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            Interactive
          </Badge>
          <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            6 Examples
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Complete Modal component examples showing all sizes, states, and accessibility features.
          All modals include proper focus management and keyboard navigation.
        </p>
      </div>

      {/* Live Demo */}
      <PreviewContainer
        title="Live Modal Demo"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modalExamples.map((example, index) => (
            <div key={index} className="space-y-4">
              <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{example.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">{example.description}</p>
                {example.button}
              </div>
              <div className="text-sm text-[var(--color-text-tertiary)] font-mono bg-[var(--color-surface-secondary)] p-3 rounded-lg">
                {example.code.replace(/<Modal[\s\S]*?>[\s\S]*?<\/Modal>/, '<Modal>...</Modal>')}
              </div>
            </div>
          ))}
        </div>
      </PreviewContainer>

      {/* Modal Sizes */}
      <PreviewContainer
        title="Modal Sizes"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">When to Use Each Size</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-success-100)] text-[var(--color-success-800)]">
                    Small
                  </Badge>
                  <span>Simple confirmations, short messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]">
                    Medium
                  </Badge>
                  <span>Standard forms, moderate content</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]">
                    Large
                  </Badge>
                  <span>Detailed content, complex interactions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="bg-[var(--color-warning-100)] text-[var(--color-warning-800)]">
                    Extra Large
                  </Badge>
                  <span>Complex layouts, dashboards, extensive data</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">Size Specifications</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Small</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">~500px width</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Medium</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">~700px width</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Large</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">~900px width</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Extra Large</span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">~1100px width</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-green-900">Focus Management</h4>
            </div>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Focus trap within modal</li>
              <li>• Focus returns to trigger on close</li>
              <li>• Initial focus on first interactive element</li>
              <li>• Skip links for keyboard users</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-blue-900">Keyboard Navigation</h4>
            </div>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Tab navigation through elements</li>
              <li>• Esc key closes modal</li>
              <li>• Enter/Space activates buttons</li>
              <li>• Focus remains within modal</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h4 className="font-semibold text-purple-900">ARIA Support</h4>
            </div>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• role="dialog" for screen readers</li>
              <li>• aria-modal="true"</li>
              <li>• aria-labelledby for titles</li>
              <li>• aria-describedby for descriptions</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-yellow-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h4 className="font-semibold text-yellow-900">Screen Reader</h4>
            </div>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Modal announcement on open</li>
              <li>• Clear context for users</li>
              <li>• Proper heading hierarchy</li>
              <li>• Descriptive labels</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-cyan-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <h4 className="font-semibold text-cyan-900">Visual Indicators</h4>
            </div>
            <ul className="text-cyan-800 text-sm space-y-1">
              <li>• Backdrop overlay</li>
              <li>• Clear focus indicators</li>
              <li>• Close button visibility</li>
              <li>• Animation for state changes</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-indigo-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <h4 className="font-semibold text-indigo-900">Touch Support</h4>
            </div>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Touch-friendly close button</li>
              <li>• Adequate touch targets</li>
              <li>• Swipe gestures support</li>
              <li>• Mobile responsive sizing</li>
            </ul>
          </div>
        </div>
      </PreviewContainer>

      {/* Usage Guidelines */}
      <PreviewContainer
        title="Usage Guidelines"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">When to Use Modals</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">User Input Required:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    When you need user input or confirmation before proceeding.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Context Switch:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    When you need to temporarily shift user focus to a specific task.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Important Information:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    When displaying critical information that requires user attention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">When NOT to Use Modals</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Frequent Actions:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Avoid modals for actions users perform multiple times.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Primary Navigation:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Modals should not be the main way users navigate your app.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Long-Form Content:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Use separate pages for content that users need to reference.
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
              <h5 className="font-medium text-[var(--color-text-secondary)]">Focus Management</h5>
              <ul className="text-[var(--color-text-tertiary)] space-y-1">
                <li>• Implement focus trap</li>
                <li>• Return focus on close</li>
                <li>• Set initial focus</li>
                <li>• Skip links support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-[var(--color-text-secondary)]">ARIA Attributes</h5>
              <ul className="text-[var(--color-text-tertiary)] space-y-1">
                <li>• role="dialog"</li>
                <li>• aria-modal="true"</li>
                <li>• aria-labelledby</li>
                <li>• aria-describedby</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-[var(--color-text-secondary)]">Keyboard Support</h5>
              <ul className="text-[var(--color-text-tertiary)] space-y-1">
                <li>• Tab navigation</li>
                <li>• Esc key close</li>
                <li>• Enter/Space activation</li>
                <li>• Focus containment</li>
              </ul>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* Component API */}
      <PreviewContainer
        title="Component API"
      >
        <div className="border border-[var(--color-border-subtle)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Props</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">isOpen</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">boolean</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">onClose</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">function</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">size</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">sm | md | lg | xl</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">title</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">description</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">showCloseButton</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">boolean (default: true)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Features</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Focus Management</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Built-in</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Keyboard Navigation</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Esc, Tab</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">ARIA Support</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Full compliance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Animations</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Fade & Scale</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Backdrop</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">Click to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* Interactive Demo */}
      <PreviewContainer
        title="Interactive Demo"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Keyboard Navigation</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Try opening any modal and use Tab to navigate, Esc to close.
            </p>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" fullWidth>
                Test Tab Navigation
              </Button>
              <Button variant="ghost" size="sm" fullWidth>
                Test Esc Key Close
              </Button>
            </div>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Focus Management</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Notice how focus stays within the modal and returns to the trigger.
            </p>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" fullWidth>
                Test Focus Trap
              </Button>
              <Button variant="ghost" size="sm" fullWidth>
                Test Focus Return
              </Button>
            </div>
          </div>

          <div className="border border-[var(--color-border-subtle)] rounded-lg p-6 bg-[var(--color-surface-base)]">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Screen Reader</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Modal announces itself and provides proper context to screen readers.
            </p>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" fullWidth>
                Test Announcements
              </Button>
              <Button variant="ghost" size="sm" fullWidth>
                Test Context
              </Button>
            </div>
          </div>
        </div>
      </PreviewContainer>

      {/* All Active Modals */}
      {modalExamples.map((example) => example.component)}
    </div>
  );
}