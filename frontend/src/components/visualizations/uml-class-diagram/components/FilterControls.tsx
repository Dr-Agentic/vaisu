import React, { useState, useCallback } from 'react';
import { Search, Filter, RotateCcw, Eye, EyeOff } from 'lucide-react';
import type { ClassEntity } from '@shared/types';

interface FilterControlsProps {
  classes: ClassEntity[];
  onFilterChange: (filteredClassIds: Set<string>) => void;
  onSearchChange: (searchTerm: string) => void;
  onFocusMode: (classId: string | null) => void;
}

interface FilterState {
  classTypes: Set<string>;
  stereotypes: Set<string>;
  packages: Set<string>;
  relationshipTypes: Set<string>;
  searchTerm: string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  classes,
  onFilterChange,
  onSearchChange,
  onFocusMode
}) => {
  const [filters, setFilters] = useState<FilterState>({
    classTypes: new Set(['class', 'interface', 'abstract', 'enum']),
    stereotypes: new Set(),
    packages: new Set(),
    relationshipTypes: new Set(),
    searchTerm: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedClass, setFocusedClass] = useState<string | null>(null);

  // Extract unique values for filter options
  const filterOptions = React.useMemo(() => {
    const stereotypes = new Set<string>();
    const packages = new Set<string>();
    
    classes.forEach(cls => {
      if (cls.stereotype) stereotypes.add(cls.stereotype);
      if (cls.package) packages.add(cls.package);
    });

    return {
      classTypes: ['class', 'interface', 'abstract', 'enum'],
      stereotypes: Array.from(stereotypes),
      packages: Array.from(packages),
      relationshipTypes: ['inheritance', 'interface', 'composition', 'aggregation', 'association', 'dependency']
    };
  }, [classes]);

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filteredClasses = classes;

    // Apply type filters
    if (filters.classTypes.size > 0) {
      filteredClasses = filteredClasses.filter(cls => filters.classTypes.has(cls.type));
    }

    // Apply stereotype filters
    if (filters.stereotypes.size > 0) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.stereotype && filters.stereotypes.has(cls.stereotype)
      );
    }

    // Apply package filters
    if (filters.packages.size > 0) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.package && filters.packages.has(cls.package)
      );
    }

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredClasses = filteredClasses.filter(cls =>
        cls.name.toLowerCase().includes(searchLower) ||
        cls.description?.toLowerCase().includes(searchLower) ||
        cls.package?.toLowerCase().includes(searchLower)
      );
    }

    const filteredIds = new Set(filteredClasses.map(cls => cls.id));
    onFilterChange(filteredIds);
  }, [classes, filters, onFilterChange]);

  // Update filters
  const updateFilter = useCallback((
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      const filterSet = newFilters[category] as Set<string>;
      
      if (checked) {
        filterSet.add(value);
      } else {
        filterSet.delete(value);
      }
      
      return newFilters;
    });
  }, []);

  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
    onSearchChange(searchTerm);
  }, [onSearchChange]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    const resetState: FilterState = {
      classTypes: new Set(['class', 'interface', 'abstract', 'enum']),
      stereotypes: new Set(),
      packages: new Set(),
      relationshipTypes: new Set(),
      searchTerm: ''
    };
    setFilters(resetState);
    setFocusedClass(null);
    onFocusMode(null);
  }, [onFocusMode]);

  // Handle focus mode
  const handleFocusMode = useCallback((classId: string | null) => {
    setFocusedClass(classId);
    onFocusMode(classId);
  }, [onFocusMode]);

  // Apply filters when they change
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Calculate visible count
  const visibleCount = React.useMemo(() => {
    let count = classes.length;
    
    if (filters.classTypes.size > 0) {
      count = classes.filter(cls => filters.classTypes.has(cls.type)).length;
    }
    
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      count = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchLower) ||
        cls.description?.toLowerCase().includes(searchLower) ||
        cls.package?.toLowerCase().includes(searchLower)
      ).length;
    }
    
    return count;
  }, [classes, filters]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Filters & Search</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {visibleCount} of {classes.length} classes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes by name, description, or package..."
            value={filters.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="p-3 space-y-4">
          {/* Class Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Class Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.classTypes.map(type => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.classTypes.has(type)}
                    onChange={(e) => updateFilter('classTypes', type, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stereotypes */}
          {filterOptions.stereotypes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Stereotypes</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.stereotypes.map(stereotype => (
                  <label key={stereotype} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.stereotypes.has(stereotype)}
                      onChange={(e) => updateFilter('stereotypes', stereotype, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>«{stereotype}»</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {filterOptions.packages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Packages</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.packages.map(pkg => (
                  <label key={pkg} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.packages.has(pkg)}
                      onChange={(e) => updateFilter('packages', pkg, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-mono text-xs">{pkg}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Focus Mode */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Mode</h4>
            <select
              value={focusedClass || ''}
              onChange={(e) => handleFocusMode(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Show all classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.type})
                </option>
              ))}
            </select>
            {focusedClass && (
              <p className="text-xs text-gray-500 mt-1">
                Showing only selected class and immediate neighbors
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};