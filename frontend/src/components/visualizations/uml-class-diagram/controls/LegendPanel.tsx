const LEGEND_ITEMS: { category: string; items: { symbol: string; label: string; color: string; note?: string }[] }[] = [
  {
    category: 'Class Types',
    items: [
      { symbol: '🔷', label: 'Class', color: 'blue', note: 'Regular class' },
      { symbol: '🔷', label: 'Interface', color: 'green', note: '«interface»' },
      { symbol: '🔶', label: 'Abstract Class', color: 'purple', note: 'Italic name' },
      { symbol: '🔸', label: 'Enum', color: 'orange', note: '«enumeration»' },
    ],
  },
  {
    category: 'Relationships',
    items: [
      { symbol: '───▷', label: 'Inheritance', color: 'blue', note: 'Hollow triangle' },
      { symbol: '┄┄▷', label: 'Realization', color: 'green', note: 'Dashed line' },
      { symbol: '───◆', label: 'Composition', color: 'red', note: 'Filled diamond' },
      { symbol: '───◇', label: 'Aggregation', color: 'orange', note: 'Hollow diamond' },
      { symbol: '───→', label: 'Association', color: 'gray', note: 'Solid line' },
      { symbol: '┄┄→', label: 'Dependency', color: 'lightgray', note: 'Dashed arrow' },
    ],
  },
  {
    category: 'Visibility',
    items: [
      { symbol: '+', label: 'Public', color: 'green' },
      { symbol: '-', label: 'Private', color: 'red' },
      { symbol: '#', label: 'Protected', color: 'orange' },
      { symbol: '~', label: 'Package', color: 'blue' },
    ],
  },
];

export function LegendPanel() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">UML Notation</h3>
      </div>

      <div className="space-y-4">
        {LEGEND_ITEMS.map((category) => (
          <div key={category.category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {category.category}
            </h4>
            <div className="space-y-1">
              {category.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-base w-8 text-center">
                    {item.symbol}
                  </span>
                  <div className="flex-1">
                    <span className="text-gray-900">{item.label}</span>
                    {item.note && (
                      <span className="text-gray-500 text-xs ml-2">
                        {item.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <p>Keyboard shortcuts:</p>
        <div className="mt-1 space-y-1">
          <div>F - Focus mode</div>
          <div>R - Reset view</div>
          <div>L - Toggle legend</div>
          <div>E - Export</div>
        </div>
      </div>
    </div>
  );
}
