import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ExternalLink, Package, Users, Code, Database } from 'lucide-react';
import type { ClassEntity, UMLRelationship, Position } from '@shared/types';

interface TooltipManagerProps {
  visible: boolean;
  element: ClassEntity | UMLRelationship | null;
  position: Position;
  relationships?: Array<{ source: string; target: string; type: string }>;
  hoverDelay?: number;
}

interface TooltipState {
  isVisible: boolean;
  element: ClassEntity | UMLRelationship | null;
  position: Position;
}

export function TooltipManager({
  visible,
  element,
  position,
  relationships = [],
  hoverDelay = 400
}: TooltipManagerProps) {
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    isVisible: false,
    element: null,
    position: { x: 0, y: 0 }
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hover delay
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (visible && element) {
      timeoutRef.current = setTimeout(() => {
        setTooltipState({
          isVisible: true,
          element,
          position
        });
      }, hoverDelay);
    } else {
      setTooltipState({
        isVisible: false,
        element: null,
        position: { x: 0, y: 0 }
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, element, position, hoverDelay]);

  if (!tooltipState.isVisible || !tooltipState.element) return null;

  const isClass = 'type' in tooltipState.element && 'attributes' in tooltipState.element;

  // Calculate tooltip position with viewport clamping
  const tooltipWidth = 380;
  // Use a safer approximate height or dynamic measurement if needed, 
  // but clamping against window.innerHeight helps preventing overflow.
  const tooltipHeight = 400;
  const padding = 20;

  const clampedPosition = {
    x: Math.max(padding, Math.min(tooltipState.position.x + 20, window.innerWidth - tooltipWidth - padding)),
    y: Math.max(padding, Math.min(tooltipState.position.y + 20, window.innerHeight - tooltipHeight - padding))
  };

  const tooltipContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 pointer-events-none max-w-sm"
        style={{
          left: clampedPosition.x,
          top: clampedPosition.y,
          width: tooltipWidth
        }}
      >
        {isClass ? (
          <ClassTooltip
            classEntity={tooltipState.element as ClassEntity}
            relationships={relationships}
          />
        ) : (
          <RelationshipTooltip relationship={tooltipState.element as UMLRelationship} />
        )}
      </motion.div>
    </AnimatePresence>
  );

  // Render to document.body using Portal
  return createPortal(tooltipContent, document.body);
}

function ClassTooltip({
  classEntity,
  relationships = []
}: {
  classEntity: ClassEntity;
  relationships?: Array<{ source: string; target: string; type: string }>;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interface': return <Code className="w-5 h-5 text-green-600" />;
      case 'abstract': return <Database className="w-5 h-5 text-purple-600" />;
      case 'enum': return <Package className="w-5 h-5 text-orange-600" />;
      default: return <Users className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'interface': return 'bg-green-50 border-green-200 text-green-800';
      case 'abstract': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'enum': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Calculate relationship statistics
  const relationshipStats = relationships.reduce((stats, rel) => {
    if (rel.source === classEntity.id || rel.target === classEntity.id) {
      stats.total++;
      if (rel.source === classEntity.id) stats.outgoing++;
      else stats.incoming++;
    }
    return stats;
  }, { total: 0, incoming: 0, outgoing: 0 });

  // Get context around source quote (50 chars before/after)
  const getSourceContext = (quote: string, fullText?: string) => {
    if (!fullText || !quote) return quote;

    const index = fullText.indexOf(quote);
    if (index === -1) return quote;

    const start = Math.max(0, index - 50);
    const end = Math.min(fullText.length, index + quote.length + 50);
    const context = fullText.slice(start, end);

    return start > 0 ? `...${context}` : context;
  };

  return (
    <>
      {/* Header with class icon and type indicator */}
      <div className={`p-4 border-b border-gray-200 ${getTypeColor(classEntity.type)} border-l-4`}>
        <div className="flex items-start gap-3">
          {getTypeIcon(classEntity.type)}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {classEntity.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {classEntity.stereotype && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  «{classEntity.stereotype}»
                </span>
              )}
              <span className="text-sm text-gray-600 capitalize font-medium">
                {classEntity.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description section */}
      {classEntity.description && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Purpose & Responsibilities
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {classEntity.description}
          </p>
        </div>
      )}

      {/* Enhanced statistics section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Statistics
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Members</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {classEntity.attributes.length + classEntity.methods.length}
            </p>
            <p className="text-xs text-gray-600">
              {classEntity.attributes.length} attrs, {classEntity.methods.length} methods
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Relationships</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {relationshipStats.total}
            </p>
            <p className="text-xs text-gray-600">
              {relationshipStats.incoming} in, {relationshipStats.outgoing} out
            </p>
          </div>
        </div>

        {/* Package/Namespace information */}
        {classEntity.package && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 mb-1">
              <Package className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Package/Namespace</span>
            </div>
            <p className="text-sm font-medium text-gray-900 font-mono">
              {classEntity.package}
            </p>
          </div>
        )}
      </div>

      {/* Source quote with enhanced context */}
      {classEntity.sourceQuote && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center gap-1 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Source Evidence
            </span>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-blue-200">
            <p className="text-sm text-gray-700 italic leading-relaxed mb-3">
              "{getSourceContext(classEntity.sourceQuote)}"
            </p>
            {classEntity.documentLink && (
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                <ExternalLink className="w-3 h-3" />
                View in Document (±50 chars context)
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function RelationshipTooltip({ relationship }: { relationship: UMLRelationship }) {
  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'inheritance': return <Users className="w-5 h-5 text-blue-600" />;
      case 'interface': return <Code className="w-5 h-5 text-green-600" />;
      case 'composition': return <Database className="w-5 h-5 text-red-600" />;
      case 'aggregation': return <Package className="w-5 h-5 text-orange-600" />;
      case 'association': return <Users className="w-5 h-5 text-gray-600" />;
      case 'dependency': return <ExternalLink className="w-5 h-5 text-purple-600" />;
      default: return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'inheritance': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'interface': return 'bg-green-50 border-green-200 text-green-800';
      case 'composition': return 'bg-red-50 border-red-200 text-red-800';
      case 'aggregation': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'association': return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'dependency': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRelationshipDescription = (type: string) => {
    switch (type) {
      case 'inheritance': return 'Child class inherits from parent class';
      case 'interface': return 'Class implements interface contract';
      case 'composition': return 'Strong ownership - part cannot exist without whole';
      case 'aggregation': return 'Weak ownership - part can exist independently';
      case 'association': return 'General relationship between classes';
      case 'dependency': return 'One class depends on another';
      default: return 'Relationship between classes';
    }
  };

  return (
    <>
      {/* Header with relationship icon and type */}
      <div className={`p-4 border-b border-gray-200 ${getRelationshipColor(relationship.type)} border-l-4`}>
        <div className="flex items-start gap-3">
          {getRelationshipIcon(relationship.type)}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {relationship.type.charAt(0).toUpperCase() + relationship.type.slice(1)} Relationship
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getRelationshipDescription(relationship.type)}
            </p>
          </div>
        </div>
      </div>

      {/* Relationship details */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Relationship Details
        </h4>

        {/* Multiplicity information */}
        {relationship.multiplicity && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Multiplicity</span>
            </div>
            <p className="text-sm text-gray-700">
              {relationship.multiplicity.from || '1'} → {relationship.multiplicity.to || '1'}
            </p>
          </div>
        )}

        {/* Role information */}
        {relationship.roles && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Package className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Roles</span>
            </div>
            <p className="text-sm text-gray-700">
              {relationship.roles.from} ↔ {relationship.roles.to}
            </p>
          </div>
        )}

        {/* Description */}
        {relationship.description && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Description</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {relationship.description}
            </p>
          </div>
        )}
      </div>

      {/* Evidence from document */}
      {relationship.sourceQuote && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center gap-1 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Evidence from Document
            </span>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-blue-200">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "{relationship.sourceQuote}"
            </p>
          </div>
        </div>
      )}
    </>
  );
}