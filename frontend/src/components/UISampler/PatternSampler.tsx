/**
 * PatternSampler Component
 *
 * Interactive examples showing all Pattern component variants and usage.
 * Demonstrates StageContainer, TabGroup, and other pattern components.
 *
 * Features:
 * - StageContainer: all variants with different layouts and animations
 * - TabGroup: all variants with different orientations and styling
 * - Interactive examples with copyable code
 * - WCAG AA compliant with proper contrast ratios
 * - Keyboard navigation testing
 * - Focus indicators visible and WCAG compliant
 * - ARIA attributes demonstrated
 */

import { useState } from 'react';

import { StageContainer, Stage } from '../patterns/StageContainer';
import { TabGroup } from '../patterns/TabGroup';
import { Button } from '../primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { PreviewContainer } from './PreviewContainer';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';

export function PatternSampler() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('tab1');

  const handleStageClick = (stageName: string) => {
    setActiveStage(activeStage === stageName ? null : stageName);
  };

  // StageContainer examples with their properties
  const stageExamples = [
    {
      title: 'Welcome Stage',
      description: 'Welcome screen with stage container',
      code: `<StageContainer currentStage="welcome"><Stage active={true}>Content</Stage></StageContainer>`,
      component: (
        <StageContainer currentStage="welcome">
          <Stage active={true}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Welcome Stage Content</h3>
              <p className="text-[var(--color-text-secondary)]">This is the welcome stage layout.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Section A</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Content for section A</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Section B</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Content for section B</p>
                </div>
              </div>
            </div>
          </Stage>
        </StageContainer>
      ),
    },
    {
      title: 'Input Stage',
      description: 'Input form stage with container',
      code: `<StageContainer currentStage="input"><Stage active={true}>Input Content</Stage></StageContainer>`,
      component: (
        <StageContainer currentStage="input">
          <Stage active={true}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Input Stage Content</h3>
              <p className="text-[var(--color-text-secondary)]">This is the input stage layout.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Left</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Left section content</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Center</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Center section content</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Right</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Right section content</p>
                </div>
              </div>
            </div>
          </Stage>
        </StageContainer>
      ),
    },
    {
      title: 'Analysis Stage',
      description: 'Analysis results stage',
      code: `<StageContainer currentStage="analysis"><Stage active={true}>Analysis Content</Stage></StageContainer>`,
      component: (
        <StageContainer currentStage="analysis">
          <Stage active={true}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Analysis Stage Content</h3>
              <p className="text-[var(--color-text-secondary)]">This is the analysis stage layout.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Content Area 1</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">First content area</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Content Area 2</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Second content area</p>
                </div>
              </div>
            </div>
          </Stage>
        </StageContainer>
      ),
    },
    {
      title: 'Visualization Stage',
      description: 'Visualization display stage',
      code: `<StageContainer currentStage="visualization"><Stage active={true}>Visualization Content</Stage></StageContainer>`,
      component: (
        <StageContainer currentStage="visualization">
          <Stage active={true}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Visualization Stage Content</h3>
              <p className="text-[var(--color-text-secondary)]">This is the visualization stage layout.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Viz 1</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">First visualization</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Viz 2</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Second visualization</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Viz 3</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Third visualization</p>
                </div>
              </div>
            </div>
          </Stage>
        </StageContainer>
      ),
    },
  ];

  // TabGroup examples with their properties
  const tabExamples = [
    {
      title: 'Default Tabs',
      description: 'Standard tab layout',
      code: `<TabGroup tabs={[{id: 'tab1', label: 'Tab 1'}]} activeTab="tab1" onTabChange={onChange} />`,
      component: (
        <TabGroup
          tabs={[
            { id: 'tab1', label: 'Default Tab 1', description: 'First tab' },
            { id: 'tab2', label: 'Default Tab 2', description: 'Second tab' },
            { id: 'tab3', label: 'Default Tab 3', description: 'Third tab' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size="md"
          variant="default"
        />
      ),
    },
    {
      title: 'Cards Tabs',
      description: 'Card-style tab layout',
      code: `<TabGroup variant="cards" tabs={[{id: 'tab1', label: 'Tab 1'}]} activeTab="tab1" onTabChange={onChange} />`,
      component: (
        <TabGroup
          tabs={[
            { id: 'tab1', label: 'Cards Tab 1', description: 'Card style first' },
            { id: 'tab2', label: 'Cards Tab 2', description: 'Card style second' },
            { id: 'tab3', label: 'Cards Tab 3', description: 'Card style third' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size="md"
          variant="cards"
        />
      ),
    },
    {
      title: 'Pill Tabs',
      description: 'Pill-shaped tab layout',
      code: `<TabGroup variant="pill" tabs={[{id: 'tab1', label: 'Tab 1'}]} activeTab="tab1" onTabChange={onChange} />`,
      component: (
        <TabGroup
          tabs={[
            { id: 'tab1', label: 'Pill Tab 1', description: 'Pill style first' },
            { id: 'tab2', label: 'Pill Tab 2', description: 'Pill style second' },
            { id: 'tab3', label: 'Pill Tab 3', description: 'Pill style third' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size="md"
          variant="pill"
        />
      ),
    },
    {
      title: 'Small Tabs',
      description: 'Compact tab layout',
      code: `<TabGroup size="sm" tabs={[{id: 'tab1', label: 'Tab 1'}]} activeTab="tab1" onTabChange={onChange} />`,
      component: (
        <TabGroup
          tabs={[
            { id: 'tab1', label: 'Small Tab 1', description: 'Small size first' },
            { id: 'tab2', label: 'Small Tab 2', description: 'Small size second' },
            { id: 'tab3', label: 'Small Tab 3', description: 'Small size third' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size="sm"
          variant="default"
        />
      ),
    },
    {
      title: 'Large Tabs',
      description: 'Large tab layout',
      code: `<TabGroup size="lg" tabs={[{id: 'tab1', label: 'Tab 1'}]} activeTab="tab1" onTabChange={onChange} />`,
      component: (
        <TabGroup
          tabs={[
            { id: 'tab1', label: 'Large Tab 1', description: 'Large size first' },
            { id: 'tab2', label: 'Large Tab 2', description: 'Large size second' },
            { id: 'tab3', label: 'Large Tab 3', description: 'Large size third' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size="lg"
          variant="default"
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Pattern Components</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            All Variants
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            Interactive
          </Badge>
          <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            11 Examples
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Complete Pattern component examples showing StageContainer and TabGroup variants with
          accessibility features and keyboard navigation.
        </p>
      </div>

      {/* StageContainer Examples */}
      <PreviewContainer
        title="StageContainer Examples"
        description="All StageContainer variants with different layouts and styling options"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stageExamples.map((stage, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stage.title}</span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {stage.title.toLowerCase().replace(' ', '-')}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)]">{stage.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-[var(--color-border-subtle)] rounded-lg p-4 bg-[var(--color-surface-base)]">
                  {stage.component}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Usage:</p>
                  <CodeBlock
                    code={stage.code}
                    language="tsx"
                    showCopyButton={false}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <CopyToClipboard
                    text={stage.code}
                    tooltip="Copy Code"
                    size="sm"
                  />
                  <CopyToClipboard
                    text={`variant="${stage.title.toLowerCase().replace(' ', '-')}"`}
                    tooltip="Copy Variant"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* TabGroup Examples */}
      <PreviewContainer
        title="TabGroup Examples"
        description="All TabGroup variants with different orientations and styling options"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tabExamples.map((tab, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{tab.title}</span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {tab.title.toLowerCase().replace(' ', '-')}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)]">{tab.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-[var(--color-border-subtle)] rounded-lg p-4 bg-[var(--color-surface-base)]">
                  {tab.component}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Usage:</p>
                  <CodeBlock
                    code={tab.code}
                    language="tsx"
                    showCopyButton={false}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <CopyToClipboard
                    text={tab.code}
                    tooltip="Copy Code"
                    size="sm"
                  />
                  <CopyToClipboard
                    text={`variant="${tab.title.toLowerCase().replace(' ', '-')}"`}
                    tooltip="Copy Variant"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Interactive Demo */}
      <PreviewContainer
        title="Interactive Pattern Demo"
        description="Test all pattern components with different configurations"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>StageContainer Demo</CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">Interactive stage container with different variants</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStageClick('demo-welcome')}
                >
                  Welcome
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStageClick('demo-input')}
                >
                  Input
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleStageClick('demo-analysis')}
                >
                  Analysis
                </Button>
              </div>
              <div className="border border-[var(--color-border-subtle)] rounded-lg p-4 bg-[var(--color-surface-base)]">
                <StageContainer currentStage={activeStage || 'welcome'}>
                  <Stage active={activeStage === 'demo-welcome'}>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Welcome Stage
                      </h3>
                      <p className="text-[var(--color-text-secondary)]">
                        This is an interactive demo showing the welcome stage variant.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                          <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Demo Content A</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">Welcome stage content</p>
                        </div>
                        <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                          <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Demo Content B</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">Stage container content</p>
                        </div>
                      </div>
                    </div>
                  </Stage>
                  <Stage active={activeStage === 'demo-input'}>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Input Stage
                      </h3>
                      <p className="text-[var(--color-text-secondary)]">
                        This is an interactive demo showing the input stage variant.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                          <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Input Content A</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">Input form content</p>
                        </div>
                        <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                          <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Input Content B</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">Form controls content</p>
                        </div>
                      </div>
                    </div>
                  </Stage>
                  <Stage active={activeStage === 'demo-analysis'}>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Analysis Stage
                      </h3>
                      <p className="text-[var(--color-text-secondary)]">
                        This is an interactive demo showing the analysis stage variant.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                          <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Analysis Content A</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">Analysis results</p>
                        </div>
                        <div className="p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                          <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Analysis Content B</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">Data visualization</p>
                        </div>
                      </div>
                    </div>
                  </Stage>
                </StageContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>TabGroup Demo</CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">Interactive tab group with different variants</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('tab1')}
                >
                  Default
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('tab2')}
                >
                  Cards
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setActiveTab('tab3')}
                >
                  Pill
                </Button>
              </div>
              <div className="border border-[var(--color-border-subtle)] rounded-lg p-4 bg-[var(--color-surface-base)]">
                <TabGroup
                  tabs={[
                    { id: 'tab1', label: 'Default Demo', description: 'Default tab style' },
                    { id: 'tab2', label: 'Cards Demo', description: 'Card tab style' },
                    { id: 'tab3', label: 'Pill Demo', description: 'Pill tab style' },
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  size="md"
                  variant={activeTab === 'tab1' ? 'default' : activeTab === 'tab2' ? 'cards' : 'pill'}
                />
                <div className="mt-4 p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                    {activeTab === 'tab1' ? 'Default' : activeTab === 'tab2' ? 'Cards' : 'Pill'} Tab Content
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    This is the content area for the {activeTab === 'tab1' ? 'default' : activeTab === 'tab2' ? 'cards' : 'pill'} tab variant.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
        description="All pattern components include proper ARIA attributes and keyboard navigation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">StageContainer Accessibility</h3>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Proper semantic structure</li>
                <li>• Keyboard navigation support</li>
                <li>• Focus management</li>
                <li>• ARIA attributes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-blue-900">TabGroup Accessibility</h3>
              </div>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Tablist ARIA roles</li>
                <li>• Keyboard navigation (Arrow keys)</li>
                <li>• Focus indicators</li>
                <li>• Screen reader support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-purple-900">Interactive States</h3>
              </div>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Hover state accessibility</li>
                <li>• Focus state visibility</li>
                <li>• Active state indication</li>
                <li>• Loading state feedback</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-yellow-900">Keyboard Navigation</h3>
              </div>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Tab navigation between components</li>
                <li>• Arrow keys for tab navigation</li>
                <li>• Enter/Space to activate</li>
                <li>• Proper focus trapping</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-cyan-900">Focus Indicators</h3>
              </div>
              <ul className="text-cyan-800 text-sm space-y-1">
                <li>• 2px focus ring with offset</li>
                <li>• High contrast colors</li>
                <li>• Consistent across variants</li>
                <li>• WCAG AA compliant</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-indigo-900">ARIA Support</h3>
              </div>
              <ul className="text-indigo-800 text-sm space-y-1">
                <li>• role="tablist" for tab groups</li>
                <li>• role="tabpanel" for content</li>
                <li>• aria-selected for state</li>
                <li>• aria-controls for relationships</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Usage Guidelines */}
      <PreviewContainer
        title="Usage Guidelines"
        description="Best practices for using pattern components in your application"
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">When to Use StageContainer</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-success-100)] text-[var(--color-success-800)]">Basic</Badge>
                    <span>Simple content containers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]">Elevated</Badge>
                    <span>Important content sections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]">Border</Badge>
                    <span>Content with visual separation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-warning-100)] text-[var(--color-warning-800)]">Gradient</Badge>
                    <span>Highlight and emphasis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-error-100)] text-[var(--color-error-800)]">Card</Badge>
                    <span>Card-like content presentation</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">When to Use TabGroup</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-success-100)] text-[var(--color-success-800)]">Horizontal</Badge>
                    <span>Standard tab navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]">Vertical</Badge>
                    <span>Side navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]">Pill</Badge>
                    <span>Modern, rounded tabs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-warning-100)] text-[var(--color-warning-800)]">Underline</Badge>
                    <span>Minimal tab styling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-error-100)] text-[var(--color-error-800)]">Segmented</Badge>
                    <span>Control groups</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-4">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Accessibility Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">StageContainer</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Use semantic HTML structure</li>
                    <li>• Provide clear focus indicators</li>
                    <li>• Ensure sufficient color contrast</li>
                    <li>• Support keyboard navigation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">TabGroup</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Use proper tablist ARIA roles</li>
                    <li>• Support arrow key navigation</li>
                    <li>• Provide visible focus states</li>
                    <li>• Announce tab changes</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">General</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• WCAG AA compliance</li>
                    <li>• Screen reader support</li>
                    <li>• Keyboard accessibility</li>
                    <li>• Touch-friendly interactions</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PreviewContainer>
    </div>
  );
}