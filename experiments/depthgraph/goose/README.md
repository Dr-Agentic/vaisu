## Goose Depth Graph Experiments - Pages 11-16

This directory contains 6 HTML visualization pages for the depth graph data using the existing design system components.

### Files Created:
- `index.html` - Overview and navigation hub
- `page11.html` - Sector Hierarchy View
- `page12.html` - Radial Network View  
- `page13.html` - Progressive Timeline View
- `page14.html` - Dimensional Filter View
- `page15.html` - Cascade Flow View
- `page16.html` - Contour Cascade View

### Access URLs:
Once the server is running, access at:
- http://localhost:7002/experiments/depthgraph/goose/page11.html
- http://localhost:7002/experiments/depthgraph/goose/page12.html
- http://localhost:7002/experiments/depthgraph/goose/page13.html
- http://localhost:7002/experiments/depthgraph/goose/page14.html
- http://localhost:7002/experiments/depthgraph/goose/page15.html
- http://localhost:7002/experiments/depthgraph/goose/page16.html

### Implementation Notes:
1. All pages use the existing Card component system from the design system
2. No new CSS classes or inline styles were created (except noted inline SVG exceptions for path rendering)
3. Grid-based layouts used throughout for responsive design
4. Progressive disclosure patterns implemented for detailed node information
5. All pages include navigation links to move between views
6. Shared data source (data.js) and styles (styles.css) from parent directory

### Visual Strategies:
- **Page 11**: Grouped by thematic sectors with expandable cards
- **Page 12**: Radial visualization with center thesis, showing connections
- **Page 13**: Time-based progression through narrative stages
- **Page 14**: Interactive filtering and sorting by metrics
- **Page 15**: Hierarchical cascade with depth-based visualization
- **Page 16**: Enhanced contour cascade with full data display and increased hierarchy visibility
