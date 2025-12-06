import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { Section } from '../../../../shared/src/types';

interface StructuredViewProps {
  data: {
    sections: Section[];
    hierarchy: any[];
  };
}

export function StructuredView({ data }: StructuredViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(data.sections.filter(s => s.level <= 2).map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-amber-500 to-amber-600',
      'from-pink-500 to-pink-600'
    ];
    return colors[Math.min(level - 1, colors.length - 1)];
  };

  const getLevelPadding = (level: number) => {
    return `${(level - 1) * 1.5}rem`;
  };

  const renderSection = (section: Section) => {
    const isExpanded = expandedSections.has(section.id);
    const hasChildren = section.children && section.children.length > 0;

    return (
      <div
        key={section.id}
        style={{ marginLeft: getLevelPadding(section.level) }}
        className="mb-4"
      >
        <div
          className={`
            bg-gradient-to-r ${getLevelColor(section.level)}
            rounded-lg p-5 text-white shadow-lg cursor-pointer
            hover:shadow-xl transition-all duration-200
            ${section.level === 1 ? 'text-lg' : 'text-base'}
          `}
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {hasChildren && (
                  <button className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                )}
                <h3 className="font-bold">
                  {section.level > 1 && `${section.level}.`} {section.title}
                </h3>
              </div>
              
              {section.summary && (
                <p className="text-sm opacity-90 leading-relaxed">
                  {section.summary}
                </p>
              )}

              {section.keywords && section.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {section.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white/20 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Navigate to original text
              }}
              title="View in original document"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-4">
            {section.children.map(child => renderSection(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Document Structure</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setExpandedSections(new Set(data.sections.map(s => s.id)))}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedSections(new Set())}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div>
        {data.sections
          .filter(section => section.level === 1)
          .map(section => renderSection(section))}
      </div>
    </div>
  );
}
