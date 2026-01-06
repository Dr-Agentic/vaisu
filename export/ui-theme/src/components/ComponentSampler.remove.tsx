/**
 * ComponentSampler Component
 *
 * A comprehensive sampler for all Electron UI components with visible labels and class IDs
 * for easy identification of readability and contrast issues. Designed for design system testing
 * and component validation.
 *
 * @example
 * ```tsx
 * <ComponentSampler />
 * ```
 */

import { ArrowLeft, Upload, ChevronDown, Eye, EyeOff, Monitor, Smartphone, Tablet } from 'lucide-react';
import { forwardRef, useState, useCallback, useEffect } from 'react';

import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../design-system/components/Card';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Spinner } from '../../design-system/components/Spinner';
import { Textarea } from '../../design-system/components/Textarea';
import { ThemeToggle } from '../../design-system/components/ThemeToggle';
import { Tooltip } from '../../design-system/components/Tooltip';
import { cn } from '../../lib/utils';
import { useDocumentStore } from '../../stores/documentStore';

export interface ComponentSamplerProps {
  /**
   * Callback when back button is clicked
   */
  onBack?: () => void;
  /**
   * Whether to show component labels
   * @default true
   */
  showLabels?: boolean;
  /**
   * Whether to show class IDs
   * @default true
   */
  showClassIds?: boolean;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

/**
 * ComponentSampler
 *
 * Interactive sampler showcasing all Electron UI components with:
 * - Visible component labels and class IDs
 * - Theme switching capabilities
 * - Device mode simulation
 * - Accessibility testing features
 */
export const ComponentSampler = forwardRef<HTMLDivElement, ComponentSamplerProps>(
  ({ onBack, showLabels = true, showClassIds = true }, ref) => {
    const [isLabelsVisible, setIsLabelsVisible] = useState(showLabels);
    const [isClassIdsVisible, setIsClassIdsVisible] = useState(showClassIds);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [inputValue, setInputValue] = useState('Sample text input');
    const [textareaValue, setTextareaValue] = useState('Sample textarea content with multiple lines...\n\nThis demonstrates text wrapping and spacing.');
    const [selectedValue, setSelectedValue] = useState('option1');

    const { setStage } = useDocumentStore();

    const handleBack = () => {
      if (onBack) {
        onBack();
      } else {
        setStage('welcome');
      }
    };

    const toggleLabels = useCallback(() => {
      setIsLabelsVisible(!isLabelsVisible);
    }, [isLabelsVisible]);

    const toggleClassIds = useCallback(() => {
      setIsClassIdsVisible(!isClassIdsVisible);
    }, [isClassIdsVisible]);

    const selectDeviceMode = useCallback((mode: DeviceMode) => {
      setDeviceMode(mode);
    }, []);

    // Apply device mode classes
    useEffect(() => {
      const root = document.documentElement;
      root.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
      root.classList.add(`device-${deviceMode}`);
    }, [deviceMode]);

    const renderComponentSample = (
      componentName: string,
      componentId: string,
      element: React.ReactNode,
      description?: string,
      qualifiers?: string[],
    ) => (
      <div className="component-sample">
        {/* Title Section - Top of Card */}
        {isLabelsVisible && (
          <div className="component-title-section">
            <div className="component-name">
              {componentName}
            </div>
          </div>
        )}

        {/* Qualifiers Section - Below Title */}
        {isLabelsVisible && (description || (qualifiers && qualifiers.length > 0)) && (
          <div className="component-qualifiers-section">
            {description && (
              <div className="component-description">
                {description}
              </div>
            )}
            {qualifiers && qualifiers.length > 0 && (
              <div className="component-qualifiers">
                {qualifiers.map((qualifier, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {qualifier}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Class ID Section - Top Right */}
        {isClassIdsVisible && (
          <div className="component-id" title="CSS Class ID">
            {componentId}
          </div>
        )}

        {/* Main Component Content */}
        <div className="component-wrapper">
          {element}
        </div>
      </div>
    );

    const selectOptions = [
      { value: 'option1', label: 'Option 1 - Primary' },
      { value: 'option2', label: 'Option 2 - Secondary' },
      { value: 'option3', label: 'Option 3 - Tertiary' },
      { value: 'option4', label: 'Option 4 - Disabled', disabled: true },
    ];

    return (
      <div
        ref={ref}
        className={cn(
          'component-sampler',
          `device-${deviceMode}`,
          'flex-1',
          'flex',
          'flex-col',
        )}
        style={{
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Header */}
        <header
          className={cn(
            'px-8',
            'py-6',
            'border-b',
            'flex',
            'items-center',
            'justify-between',
          )}
          style={{
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className={cn(
                'flex',
                'items-center',
                'gap-2',
                'px-4',
                'py-2',
                'rounded-md',
                'transition-all',
                'duration-[var(--duration-fast)]',
                'outline-none',
                'hover:bg-white/5',
              )}
              style={{
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Back to App</span>
            </button>

            <h2
              className="text-2xl font-semibold"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {/* Component Sampler title removed */}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Device Mode Selector */}
            <div className="device-controls">
              <span
                className="device-label"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  marginRight: '8px',
                }}
              >
                Device:
              </span>
              <div className="device-buttons">
                {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => selectDeviceMode(mode)}
                    className={cn(
                      'device-btn',
                      deviceMode === mode && 'active',
                    )}
                    style={{
                      backgroundColor: deviceMode === mode ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      border: '1px solid var(--color-border-base)',
                      color: deviceMode === mode ? 'var(--aurora-1)' : 'var(--color-text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    {mode === 'desktop' && <Monitor className="w-4 h-4" />}
                    {mode === 'tablet' && <Tablet className="w-4 h-4" />}
                    {mode === 'mobile' && <Smartphone className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility Controls */}
            <div className="visibility-controls">
              <button
                onClick={toggleLabels}
                className={cn(
                  'visibility-btn',
                  isLabelsVisible && 'active',
                )}
                style={{
                  backgroundColor: isLabelsVisible ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: '1px solid var(--color-border-base)',
                  color: isLabelsVisible ? 'var(--aurora-1)' : 'var(--color-text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <Eye className="w-4 h-4" />
                <span style={{ marginLeft: '6px' }}>Labels</span>
              </button>

              <button
                onClick={toggleClassIds}
                className={cn(
                  'visibility-btn',
                  isClassIdsVisible && 'active',
                )}
                style={{
                  backgroundColor: isClassIdsVisible ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: '1px solid var(--color-border-base)',
                  color: isClassIdsVisible ? 'var(--aurora-1)' : 'var(--color-text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <EyeOff className="w-4 h-4" />
                <span style={{ marginLeft: '6px' }}>IDs</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div
          className={cn(
            'flex-1',
            'overflow-auto',
            'p-8',
            'space-y-8',
          )}
        >
          {/* Buttons Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Buttons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderComponentSample(
                'Gradient Primary Button',
                'btn-gradient-primary',
                <Button
                  variant="gradient-primary"
                  size="md"
                  onClick={() => console.log('Gradient Primary clicked')}
                >
                  Gradient Action
                </Button>,
                'Primary button with animated aurora gradient background',
                ['Interactive', 'Primary'],
              )}

              {renderComponentSample(
                'Secondary Button',
                'btn-secondary',
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => console.log('Secondary clicked')}
                >
                  Secondary Action
                </Button>,
                'Supporting action with static blue-cyan gradient',
                ['Supporting', 'Secondary'],
              )}

              {renderComponentSample(
                'Ghost Button',
                'btn-ghost',
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => console.log('Ghost clicked')}
                >
                  Ghost Action
                </Button>,
                'Minimal styling for subtle interactions',
              )}

              {renderComponentSample(
                'Outline Button',
                'btn-outline',
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => console.log('Outline clicked')}
                >
                  Outline Action
                </Button>,
                'Border-focused design for light emphasis',
              )}

              {renderComponentSample(
                'Aurora Button',
                'btn-aurora',
                <Button
                  variant="aurora"
                  size="md"
                  onClick={() => console.log('Aurora clicked')}
                >
                  Aurora Effect
                </Button>,
                'Animated gradient border with slow rotation',
              )}

              {renderComponentSample(
                'Nova Button',
                'btn-nova',
                <Button
                  variant="nova"
                  size="md"
                  onClick={() => console.log('Nova clicked')}
                >
                  Nova Effect
                </Button>,
                'Animated gradient border with cyan/purple scheme',
              )}

              {renderComponentSample(
                'Danger Button',
                'btn-danger',
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => console.log('Danger clicked')}
                >
                  Delete Item
                </Button>,
                'Destructive action with error styling',
              )}

              {renderComponentSample(
                'Small Button',
                'btn-small',
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => console.log('Small clicked')}
                >
                  Small
                </Button>,
                'Compact button for tight spaces',
                ['Compact', 'Small', 'Space-saving'],
              )}

              {renderComponentSample(
                'Large Button',
                'btn-large',
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => console.log('Large clicked')}
                >
                  Large Action
                </Button>,
                'Prominent call-to-action button',
              )}

              {renderComponentSample(
                'Loading Button',
                'btn-loading',
                <Button
                  variant="primary"
                  size="md"
                  loading
                  onClick={() => console.log('Loading clicked')}
                >
                  Processing...
                </Button>,
                'Button with loading spinner and disabled state',
              )}

              {renderComponentSample(
                'Button with Icons',
                'btn-icons',
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Upload className="w-4 h-4" />}
                  rightIcon={<ChevronDown className="w-4 h-4" />}
                  onClick={() => console.log('Icons clicked')}
                >
                  Upload Document
                </Button>,
                'Button with left and right icon placement',
              )}

              {renderComponentSample(
                'Full Width Button',
                'btn-full-width',
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => console.log('Full width clicked')}
                >
                  Full Width Action
                </Button>,
                'Button that spans entire container width',
              )}
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderComponentSample(
                'Primary Badge',
                'badge-primary',
                <Badge variant="primary">Primary</Badge>,
                'Standard primary badge',
              )}

              {renderComponentSample(
                'Secondary Badge',
                'badge-secondary',
                <Badge variant="secondary">Secondary</Badge>,
                'Secondary color scheme',
              )}

              {renderComponentSample(
                'Success Badge',
                'badge-success',
                <Badge variant="success">Success</Badge>,
                'Positive status indicator',
              )}

              {renderComponentSample(
                'Error Badge',
                'badge-error',
                <Badge variant="error">Error</Badge>,
                'Error or warning state',
              )}

              {renderComponentSample(
                'Warning Badge',
                'badge-warning',
                <Badge variant="warning">Warning</Badge>,
                'Caution or warning state',
              )}

              {renderComponentSample(
                'Info Badge',
                'badge-info',
                <Badge variant="info">Info</Badge>,
                'Informational status',
              )}

              {renderComponentSample(
                'Aurora Badge',
                'badge-aurora',
                <Badge variant="aurora">Aurora</Badge>,
                'Gradient-themed badge',
              )}

              {renderComponentSample(
                'Nova Badge',
                'badge-nova',
                <Badge variant="nova">Nova</Badge>,
                'Cyan gradient badge',
              )}

              {renderComponentSample(
                'Small Badge',
                'badge-small',
                <Badge variant="primary" size="sm">Small</Badge>,
                'Compact badge size',
              )}

              {renderComponentSample(
                'Large Badge',
                'badge-large',
                <Badge variant="primary" size="lg">Large Badge</Badge>,
                'Prominent badge display',
              )}
            </div>
          </section>

          {/* Cards Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderComponentSample(
                'Base Card',
                'card-base',
                <Card variant="base" padding="md">
                  <CardHeader>
                    <CardTitle>Base Card</CardTitle>
                    <CardDescription>Standard card with subtle border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This is the base card variant with clean styling and subtle borders.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Action</Button>
                  </CardFooter>
                </Card>,
                'Default card styling with base variant',
                ['Standard', 'Base', 'Clean'],
              )}

              {renderComponentSample(
                'Elevated Card',
                'card-elevated',
                <Card variant="elevated" padding="md">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                    <CardDescription>Card with shadow elevation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card features a subtle shadow for depth perception.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="primary" size="sm">Confirm</Button>
                  </CardFooter>
                </Card>,
                'Card with shadow for visual hierarchy',
              )}

              {renderComponentSample(
                'Outlined Card',
                'card-outlined',
                <Card variant="outlined" padding="md">
                  <CardHeader>
                    <CardTitle>Outlined Card</CardTitle>
                    <CardDescription>Bordered design variant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Stronger borders for emphasis and separation.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" size="sm">Details</Button>
                  </CardFooter>
                </Card>,
                'Card with prominent borders',
              )}

              {renderComponentSample(
                'Mesh Glow Card',
                'card-mesh-glow',
                <Card variant="mesh-glow" padding="md">
                  <CardHeader>
                    <CardTitle>Mesh Glow Card</CardTitle>
                    <CardDescription>Void-themed with radial gradients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Special Electron UI variant with void mesh glow effect.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="aurora" size="sm">Explore</Button>
                  </CardFooter>
                </Card>,
                'Electron UI specific gradient effect',
              )}

              {renderComponentSample(
                'Gradient Border Card',
                'card-gradient-border',
                <Card variant="gradient-border-animated" padding="lg">
                  <CardHeader>
                    <CardTitle>Gradient Border</CardTitle>
                    <CardDescription>Animated rotating border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Advanced visual effect with animated gradient border.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="aurora" size="sm">Activate</Button>
                  </CardFooter>
                </Card>,
                'Card with animated gradient border',
              )}

              {renderComponentSample(
                'Interactive Card',
                'card-interactive',
                <Card variant="elevated" padding="md" interactive>
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                    <CardDescription>Hover effects enabled</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card that responds to hover interactions with elevation.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm">Hover Me</Button>
                  </CardFooter>
                </Card>,
                'Card with hover interaction effects',
              )}
            </div>
          </section>

          {/* Forms Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Form Elements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderComponentSample(
                'Text Input',
                'input-text',
                <Input
                  type="text"
                  placeholder="Enter text here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  label="Text Input"
                  helperText="Standard text input field"
                />,
                'Primary text input with label and description',
              )}

              {renderComponentSample(
                'Email Input',
                'input-email',
                <Input
                  type="email"
                  placeholder="user@example.com"
                  label="Email Address"
                  size="lg"
                />,
                'Email-specific input with filled styling',
              )}

              {renderComponentSample(
                'Password Input',
                'input-password',
                <Input
                  type="password"
                  placeholder="••••••••"
                  label="Password"
                  size="md"
                />,
                'Password input with secure masking',
              )}

              {renderComponentSample(
                'Textarea',
                'textarea',
                <Textarea
                  placeholder="Enter multiple lines of text..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  label="Textarea"
                  helperText="Multi-line text input"
                  rows={4}
                />,
                'Multi-line text input with auto-sizing',
              )}

              {renderComponentSample(
                'Select Dropdown',
                'select',
                <Select
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  label="Select Option"
                  placeholder="Choose an option"
                  options={selectOptions}
                  size="md"
                />,
                'Dropdown selection with multiple options',
              )}

              {renderComponentSample(
                'Disabled Input',
                'input-disabled',
                <Input
                  type="text"
                  placeholder="Disabled input"
                  label="Disabled State"
                  disabled
                  value="Cannot edit this"
                />,
                'Input in disabled state for read-only scenarios',
              )}

              {renderComponentSample(
                'Error Input',
                'input-error',
                <Input
                  type="text"
                  placeholder="Input with error"
                  label="Error State"
                  error="This field has an error"
                  value="Invalid input"
                />,
                'Input displaying error state and message',
              )}

              {renderComponentSample(
                'Success Input',
                'input-success',
                <Input
                  type="text"
                  placeholder="Valid input"
                  label="Success State"
                  helperText="This field is valid"
                  value="Valid value"
                />,
                'Input displaying success state and message',
              )}

              {renderComponentSample(
                'Search Input',
                'input-search',
                <Input
                  type="search"
                  placeholder="Search documents..."
                  label="Search"
                  leftIcon={<Upload className="w-4 h-4" />}
                />,
                'Search input with icon',
              )}
            </div>
          </section>

          {/* Status Indicators Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Status Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderComponentSample(
                'Loading Spinner',
                'spinner-loading',
                <div className="flex items-center gap-4">
                  <Spinner size="md" variant="primary" />
                  <div>
                    <div className="spinner-label">Loading</div>
                    <div className="spinner-sublabel">Primary spinner variant</div>
                  </div>
                </div>,
                'Circular loading indicator',
              )}

              {renderComponentSample(
                'Secondary Spinner',
                'spinner-dots',
                <div className="flex items-center gap-4">
                  <Spinner size="lg" variant="secondary" />
                  <div>
                    <div className="spinner-label">Processing</div>
                    <div className="spinner-sublabel">Secondary spinner variant</div>
                  </div>
                </div>,
                'Secondary loading animation',
              )}

              {renderComponentSample(
                'Progress Ring',
                'progress-ring',
                <div className="progress-ring-sample">
                  <div className="progress-ring" />
                  <div className="progress-label">Progress</div>
                </div>,
                'Circular progress indicator from Electron UI',
              )}

              {renderComponentSample(
                'Tooltip Example',
                'tooltip',
                <div className="tooltip-sample">
                  <Tooltip content="This is a tooltip example">
                    <Button variant="outline" size="md">
                      Hover for Tooltip
                    </Button>
                  </Tooltip>
                </div>,
                'Interactive tooltip component',
              )}

              {renderComponentSample(
                'Badge with Status',
                'badge-status',
                <div className="badge-status-sample">
                  <Badge variant="success">Active</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="error">Error</Badge>
                </div>,
                'Status badges for different states',
              )}

              {renderComponentSample(
                'Stage Indicators',
                'stage-indicators',
                <div className="stage-indicators-sample">
                  <div className="stage-dot active" />
                  <div className="stage-dot completed" />
                  <div className="stage-dot" />
                  <div className="stage-dot" />
                  <div className="stage-labels">
                    <span>Welcome</span>
                    <span>Input</span>
                    <span>Analysis</span>
                    <span>Visualization</span>
                  </div>
                </div>,
                'Multi-step progress indicators',
              )}
            </div>
          </section>

          {/* Advanced Components Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Advanced Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderComponentSample(
                'Theme Toggle',
                'theme-toggle',
                <ThemeToggle />,
                'System theme switching component',
              )}

              {renderComponentSample(
                'Complex Card Layout',
                'card-complex',
                <Card variant="elevated" padding="md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Complex Layout</CardTitle>
                        <CardDescription>Multiline card with complex content</CardDescription>
                      </div>
                      <Badge variant="aurora">Premium</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="card-subtitle">Section A</h4>
                        <p className="card-text">Left column content with detailed information.</p>
                      </div>
                      <div>
                        <h4 className="card-subtitle">Section B</h4>
                        <p className="card-text">Right column with complementary details.</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Input
                        type="text"
                        placeholder="Inline input within card"
                        size="sm"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Cancel</Button>
                        <Button variant="primary" size="sm">Save</Button>
                      </div>
                      <Tooltip content="This is a complex component">
                        <Button variant="outline" size="sm">
                          More Info
                        </Button>
                      </Tooltip>
                    </div>
                  </CardFooter>
                </Card>,
                'Complex card with nested components and layout',
                ['Complex', 'Technical', 'Advanced', 'Multi-section'],
              )}

              {renderComponentSample(
                'Button Group',
                'button-group',
                <div className="button-group-sample">
                  <Button variant="outline" size="md">First</Button>
                  <Button variant="primary" size="md">Middle</Button>
                  <Button variant="ghost" size="md">Last</Button>
                </div>,
                'Grouped buttons for related actions',
              )}

              {renderComponentSample(
                'Responsive Grid',
                'responsive-grid',
                <div className="responsive-grid-sample">
                  <Card variant="mesh-glow" padding="sm" className="grid-item">
                    <CardTitle>Item 1</CardTitle>
                    <CardContent>Responsive item</CardContent>
                  </Card>
                  <Card variant="mesh-glow" padding="sm" className="grid-item">
                    <CardTitle>Item 2</CardTitle>
                    <CardContent>Responsive item</CardContent>
                  </Card>
                  <Card variant="mesh-glow" padding="sm" className="grid-item">
                    <CardTitle>Item 3</CardTitle>
                    <CardContent>Responsive item</CardContent>
                  </Card>
                </div>,
                'Grid layout demonstrating responsive behavior',
              )}
            </div>
          </section>

          {/* Accessibility Testing Section */}
          <section>
            <h3
              className="section-title"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              Accessibility Testing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderComponentSample(
                'High Contrast Test',
                'contrast-test',
                <div className="contrast-test-sample">
                  <div className="contrast-box" style={{ backgroundColor: 'var(--color-interactive-primary-base)', color: 'white' }}>
                    <strong>High Contrast</strong>
                    <p>Primary color with white text</p>
                  </div>
                  <div className="contrast-box" style={{ backgroundColor: 'var(--color-background-primary)', color: 'var(--color-text-primary)' }}>
                    <strong>Standard Text</strong>
                    <p>Body text on background</p>
                  </div>
                  <div className="contrast-box" style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-secondary)' }}>
                    <strong>Secondary Text</strong>
                    <p>Secondary text on surface</p>
                  </div>
                </div>,
                'Contrast testing for accessibility compliance',
              )}

              {renderComponentSample(
                'Focus States',
                'focus-states',
                <div className="focus-test-sample">
                  <Button variant="primary" size="md">Primary Focus</Button>
                  <Button variant="outline" size="md">Outline Focus</Button>
                  <Button variant="ghost" size="md">Ghost Focus</Button>
                  <Input type="text" placeholder="Focus me" />
                  <Select
                    value="option1"
                    onChange={() => {}}
                    options={selectOptions}
                    placeholder="Focus dropdown"
                  />
                </div>,
                'Components with proper focus indicators',
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className={cn(
            'px-8',
            'py-6',
            'border-t',
            'text-center',
          )}
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <p>Component Sampler - Test readability, contrast, and accessibility across themes and devices</p>
          <p className="mt-2">Use the controls above to toggle labels, class IDs, and device modes</p>
        </div>
      </div>
    );
  },
);

ComponentSampler.displayName = 'ComponentSampler';

/* ============================================
   SAMPLER STYLES
   ============================================ */

/* Add custom styles for the sampler */
const samplerStyles = `
  /* Component Sample Container */
  .component-sampler {
    min-height: 100vh;
  }

  .component-sample {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    transition: all var(--motion-duration-base) var(--motion-easing-ease-out);
  }

  .component-sample:hover {
    border-color: var(--color-border-strong);
    transform: translateY(-2px);
    box-shadow: var(--elevation-md);
  }

  /* Labels and IDs */
  .component-labels {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .component-title-section {
    margin-bottom: var(--spacing-sm);
  }

  .component-qualifiers-section {
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .component-name {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .component-description {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin-bottom: var(--spacing-xs);
  }

  .component-qualifiers {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .component-id {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    color: var(--aurora-1);
    background: rgba(99, 102, 241, 0.1);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .component-wrapper {
    position: relative;
  }

  /* Section Titles */
  .section-title {
    position: relative;
    padding-left: var(--spacing-lg);
  }

  .section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background: linear-gradient(to bottom, var(--aurora-1), var(--nova-1));
    border-radius: 2px;
  }

  /* Device Mode Controls */
  .device-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .device-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    transition: all var(--motion-duration-base) var(--motion-easing-ease-out);
  }

  .device-btn.active {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
  }

  /* Visibility Controls */
  .visibility-controls {
    display: flex;
    gap: var(--spacing-sm);
  }

  .visibility-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    transition: all var(--motion-duration-base) var(--motion-easing-ease-out);
  }

  .visibility-btn.active {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
  }

  /* Special Component Styles */
  .spinner-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .spinner-sublabel {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  .progress-ring-sample {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .progress-label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .tooltip-sample {
    display: flex;
    justify-content: center;
  }

  .badge-status-sample {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .stage-indicators-sample {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--color-surface-base);
    border-radius: var(--radius-md);
  }

  .stage-labels {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-left: var(--spacing-md);
  }

  .card-subtitle {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .card-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }

  .button-group-sample {
    display: flex;
    gap: var(--spacing-sm);
  }

  .responsive-grid-sample {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }

  .grid-item {
    min-height: 120px;
  }

  .contrast-test-sample {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }

  .contrast-box {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-base);
  }

  .focus-test-sample {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  /* Device Mode Classes */
  .device-desktop {
    max-width: 1200px;
    margin: 0 auto;
  }

  .device-tablet {
    max-width: 768px;
    margin: 0 auto;
  }

  .device-mobile {
    max-width: 480px;
    margin: 0 auto;
  }

  /* Responsive Grid Adjustments */
  @media (max-width: 1024px) {
    .responsive-grid-sample {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 768px) {
    .responsive-grid-sample {
      grid-template-columns: 1fr;
    }
    .contrast-test-sample {
      grid-template-columns: 1fr;
    }
    .device-controls,
    .visibility-controls {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

/* Inject styles if not already present */
if (typeof document !== 'undefined') {
  const styleId = 'component-sampler-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = samplerStyles;
    document.head.appendChild(style);
  }
}
