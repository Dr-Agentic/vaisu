import { useState } from 'react';
import type { TermsDefinitionsData, GlossaryTerm } from '../../../../shared/src/types';
import { Search, BookOpen, Filter } from 'lucide-react';

interface TermsDefinitionsProps {
  data: TermsDefinitionsData;
}

export function TermsDefinitions({ data }: TermsDefinitionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Safety check for data structure
  if (!data || !data.terms || !Array.isArray(data.terms)) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-lg">Unable to load terms data</p>
      </div>
    );
  }

  // Filter and search logic
  const filteredTerms = data.terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || term.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary-600" />
            Terms & Definitions
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({data.metadata.totalTerms} terms)
            </span>
          </h2>
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search terms or definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-2 flex-wrap">
              {['all', 'acronym', 'technical', 'jargon', 'concept'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`
                    px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                    ${filterType === type
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredTerms.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-lg mb-2">
            {searchQuery || filterType !== 'all' 
              ? 'No terms match your search' 
              : 'No terms were extracted from this document'}
          </p>
          {(searchQuery || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Terms grid */}
      {filteredTerms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTerms.map(term => (
            <TermCard key={term.id} term={term} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TermCardProps {
  term: GlossaryTerm;
}

function TermCard({ term }: TermCardProps) {
  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      acronym: 'bg-blue-100 text-blue-700',
      technical: 'bg-purple-100 text-purple-700',
      jargon: 'bg-amber-100 text-amber-700',
      concept: 'bg-emerald-100 text-emerald-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition-all duration-200">
      {/* Term title */}
      <h3 className="font-bold text-gray-900 text-lg mb-2">
        {term.term}
      </h3>
      
      {/* Definition */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {term.definition}
      </p>
      
      {/* Metadata badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`px-2 py-1 text-xs rounded ${getTypeBadgeColor(term.type)}`}>
          {term.type}
        </span>
        {term.mentions > 1 && (
          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
            {term.mentions} mentions
          </span>
        )}
      </div>
    </div>
  );
}
