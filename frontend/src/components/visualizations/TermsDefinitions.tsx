import { Search, Filter, BookOpen, Hash, Tag } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { TermsDefinitionsData, GlossaryTerm } from '../../../../shared/src/types';
import { Badge, BadgeVariant } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../primitives/Card';
import { Input } from '../primitives/Input';

import { GraphViewerLayout } from './toolkit/GraphViewerLayout';

interface TermsDefinitionsProps {
  data: TermsDefinitionsData;
}

const getTypeBadgeVariant = (type: string): BadgeVariant => {
  switch (type) {
    case 'acronym': return 'info';
    case 'technical': return 'secondary';
    case 'jargon': return 'warning';
    case 'concept': return 'success';
    default: return 'neutral';
  }
};

const TermCard: React.FC<{ term: GlossaryTerm }> = ({ term }) => (
  <Card variant="outlined" interactive padding="md" className="h-full flex flex-col">
    <CardHeader className="space-y-3">
      {/* Title Section - Top of Card */}
      <div className="flex justify-between items-start gap-2">
        <CardTitle as="h3" className="text-lg font-semibold">
          {term.term}
        </CardTitle>
        <Badge variant={getTypeBadgeVariant(term.type)} size="sm">
          {term.type}
        </Badge>
      </div>

      {/* Qualifiers Section - Below Title */}
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {term.definition}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {term.qualifiers && term.qualifiers.map((qualifier, index) => (
            <Badge key={index} variant="secondary" size="sm">
              {qualifier}
            </Badge>
          ))}
        </div>
      </div>
    </CardHeader>

    <CardContent className="flex-1 space-y-4">
      {term.context && (
        <div className="p-3 bg-[var(--color-background-secondary)] rounded-md border border-[var(--color-border-subtle)]">
          <p className="text-xs italic text-[var(--color-text-tertiary)]">
            "{term.context}"
          </p>
        </div>
      )}

      <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]" title="Confidence Score">
          <Tag className="w-3 h-3" />
          <span>{Math.round(term.confidence * 100)}% confidence</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]" title="Mentions in document">
          <Hash className="w-3 h-3" />
          <span>{term.mentions} mentions</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TermsDefinitions: React.FC<TermsDefinitionsProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');

  const filteredTerms = useMemo(() => {
    if (!data || !data.terms) return [];

    return data.terms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase())
                          || term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || term.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, selectedType]);

  const uniqueTypes = useMemo(() => {
    if (!data || !data.terms) return [];
    const types = new Set(data.terms.map(t => t.type));
    return Array.from(types);
  }, [data]);

  if (!data || !data.terms) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
        No terms available.
      </div>
    );
  }

  return (
    <GraphViewerLayout
      title="Terms & Definitions"
      description={`Glossary of ${data.metadata?.totalTerms || 0} key terms extracted from the document.`}
    >
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-[var(--color-background-primary)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />}
                fullWidth
              />
            </div>

            {/* Type Selector - Moved below search bar for better space management */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <Filter className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
              <Button
                variant={selectedType === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                All
              </Button>
              {uniqueTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 p-6 overflow-auto custom-scrollbar">
          {filteredTerms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1920px] mx-auto">
              {filteredTerms.map((term) => (
                <TermCard key={term.id} term={term} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-secondary)]">
              <BookOpen className="w-12 h-12 mb-4 opacity-20" />
              <p>No terms found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </GraphViewerLayout>
  );
};
