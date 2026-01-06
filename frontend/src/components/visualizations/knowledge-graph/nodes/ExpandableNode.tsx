import { ChevronDown, ChevronRight } from 'lucide-react';
import { Handle, Position } from 'reactflow';

import type { EnhancedGraphNode } from '../../../../../../shared/src/types';

interface ExpandableNodeProps {
  data: {
    node: EnhancedGraphNode;
    isSelected: boolean;
    isHighlighted: boolean;
    isDimmed: boolean;
    isExpanded: boolean;
    onExpand: (id: string) => void;
    onCollapse: (id: string) => void;
  };
}

export function ExpandableNode({ data }: ExpandableNodeProps) {
  const { node, isSelected, isHighlighted, isDimmed, isExpanded, onExpand, onCollapse } = data;

  // Calculate size based on centrality
  const baseWidth = 120;
  const maxWidth = 200;
  const width = baseWidth + (node.metadata.centrality * (maxWidth - baseWidth));

  const baseHeight = 60;
  const maxHeight = 80;
  const height = baseHeight + (node.metadata.centrality * (maxHeight - baseHeight));

  // Determine opacity
  const opacity = isDimmed ? 0.2 : 1.0;

  // Determine border style
  const borderWidth = isSelected ? 3 : 1;
  const borderColor = isSelected ? '#FFFFFF' : node.color;

  // Get icon
  const icon = node.label.match(/[\p{Emoji}]/u)?.[0] || '📄';

  // Truncate label
  const maxLabelLength = Math.floor(width / 8);
  const displayLabel = node.label.length > maxLabelLength
    ? `${node.label.substring(0, maxLabelLength - 3)}...`
    : node.label;

  // Truncate subtitle
  const subtitle = node.metadata.description?.substring(0, 40) || '';
  const displaySubtitle = subtitle.length > 40 ? `${subtitle.substring(0, 37)}...` : subtitle;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded) {
      onCollapse(node.id);
    } else {
      onExpand(node.id);
    }
  };

  return (
    <div
      className="expandable-node"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: node.color,
        borderRadius: '8px',
        border: `${borderWidth}px solid ${borderColor}`,
        opacity,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
        transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
        position: 'relative',
      }}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      {/* Expand/Collapse Badge */}
      {node.isExpandable && (
        <div
          onClick={handleToggle}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 600,
            color: node.color,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          title={isExpanded ? 'Collapse' : `Expand (${node.children.length} children)`}
        >
          {isExpanded ? (
            <ChevronDown size={12} />
          ) : (
            <ChevronRight size={12} />
          )}
        </div>
      )}

      {/* Icon */}
      <div
        style={{
          fontSize: '16px',
          marginBottom: '4px',
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: '1.2',
          marginBottom: '2px',
        }}
      >
        {displayLabel}
      </div>

      {/* Subtitle */}
      {displaySubtitle && (
        <div
          style={{
            fontSize: '9px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.85)',
            textAlign: 'center',
            lineHeight: '1.2',
          }}
        >
          {displaySubtitle}
        </div>
      )}
    </div>
  );
}
