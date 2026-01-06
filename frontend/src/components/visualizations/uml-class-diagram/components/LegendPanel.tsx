import { HelpCircle, X } from 'lucide-react';

interface LegendPanelProps {
  visible: boolean;
  onToggle: () => void;
}

export const LegendPanel: React.FC<LegendPanelProps> = ({ visible, onToggle }) => {
  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Show UML Legend"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">UML Notation Guide</h3>
        <button
          onClick={onToggle}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Class Types */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Class Types</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-blue-50 border-2 border-blue-600 rounded" />
              <span>Class</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-green-50 border-2 border-green-600 rounded" />
              <span>Interface</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-purple-50 border-2 border-purple-600 rounded" />
              <span>Abstract Class</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-orange-50 border-2 border-orange-600 rounded" />
              <span>Enumeration</span>
            </div>
          </div>
        </div>

        {/* Relationships */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Relationships</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <svg width="32" height="16" className="flex-shrink-0">
                <line x1="0" y1="8" x2="24" y2="8" stroke="#3b82f6" strokeWidth="2" />
                <polygon points="24,8 18,5 18,11" fill="white" stroke="#3b82f6" strokeWidth="1" />
              </svg>
              <span>Inheritance</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="32" height="16" className="flex-shrink-0">
                <line x1="0" y1="8" x2="24" y2="8" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                <polygon points="24,8 18,5 18,11" fill="white" stroke="#10b981" strokeWidth="1" />
              </svg>
              <span>Interface Realization</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="32" height="16" className="flex-shrink-0">
                <polygon points="0,8 6,5 12,8 6,11" fill="#ef4444" stroke="#ef4444" strokeWidth="1" />
                <line x1="12" y1="8" x2="32" y2="8" stroke="#ef4444" strokeWidth="2" />
              </svg>
              <span>Composition</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="32" height="16" className="flex-shrink-0">
                <polygon points="0,8 6,5 12,8 6,11" fill="white" stroke="#f97316" strokeWidth="1" />
                <line x1="12" y1="8" x2="32" y2="8" stroke="#f97316" strokeWidth="2" />
              </svg>
              <span>Aggregation</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="32" height="16" className="flex-shrink-0">
                <line x1="0" y1="8" x2="24" y2="8" stroke="#6b7280" strokeWidth="2" />
                <polygon points="24,8 20,6 20,10" fill="none" stroke="#6b7280" strokeWidth="1" />
              </svg>
              <span>Association</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="32" height="16" className="flex-shrink-0">
                <line x1="0" y1="8" x2="24" y2="8" stroke="#9ca3af" strokeWidth="2" strokeDasharray="3,3" />
                <polygon points="24,8 20,6 20,10" fill="none" stroke="#9ca3af" strokeWidth="1" />
              </svg>
              <span>Dependency</span>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Visibility</h4>
          <div className="space-y-1 text-sm font-mono">
            <div className="flex items-center gap-3">
              <span className="w-4 text-center font-bold">+</span>
              <span>Public</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center font-bold">-</span>
              <span>Private</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center font-bold">#</span>
              <span>Protected</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center font-bold">~</span>
              <span>Package</span>
            </div>
          </div>
        </div>

        {/* Modifiers */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Modifiers</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-3">
              <span className="underline">underlined</span>
              <span>Static member</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="italic">italicized</span>
              <span>Abstract member</span>
            </div>
          </div>
        </div>

        {/* Zoom Levels */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Zoom Levels</h4>
          <div className="space-y-1 text-sm">
            <div><strong>&lt; 60%:</strong> Class names only</div>
            <div><strong>60-90%:</strong> + Attributes</div>
            <div><strong>90-150%:</strong> + Methods</div>
            <div><strong>&gt; 150%:</strong> + Enhanced details</div>
          </div>
        </div>
      </div>
    </div>
  );
};
