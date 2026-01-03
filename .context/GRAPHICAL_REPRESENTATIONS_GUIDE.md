# Graphical Representations Design Guide

## Philosophy: Clarity & Simplicity

### Core Principles
1.  **Content First**: Data visualization should enhance content, not distract from it.
2.  **Standard Technologies**: Use standard DOM elements (HTML/CSS) and SVG for rendering. Avoid heavy WebGL libraries unless strictly necessary.
3.  **Performance**: Prioritize lightweight components that render instantly.
4.  **Accessibility**: Adhere to WCAG 2.2 AA and implement the **APCA (Accessible Perceptual Contrast Algorithm)** for text contrast.

---

## 1. Visual Text Readability (2025 Standards)

### 1.1 Contrast and Polarity
-   **APCA Standard**: Use APCA (Lc) for evaluating contrast based on human perception.
-   **Weight Adjustment**: Higher contrast is required for thin fonts. In **Dark Mode**, increase font-weight slightly to mitigate "halation" (glow).
-   **User Control**: Mandatory toggle between Light Mode (positive polarity) and Dark Mode (negative polarity).

### 1.2 Typography Selection
-   **UI/System Fonts**: Use modern sans-serif typefaces (e.g., Inter, Roboto, San Francisco) for general interfaces.
-   **Legibility Features**: Prioritize fonts with a **tall x-height** and disambiguated characters (e.g., distinguishing 'l', 'I', and '1').
-   **Accessibility Typefaces**: Implement **Atkinson Hyperlegible** for scenarios requiring maximum character distinction.
-   **Fluency**: Avoid "Bionic Reading" or other algorithmic bolding that disrupts natural word shape recognition.

### 1.3 Layout and Fluid Scaling
-   **Line Length (CPL)**:
    -   **Desktop**: 50–75 characters per line.
    -   **Mobile**: 30–50 characters per line.
-   **Vertical Rhythm**: Set line height (leading) between **1.3 and 1.5 times** the font size.
-   **Fluid Typography**: Use CSS `clamp()` to scale text smoothly across viewports while maintaining a mathematical **Modular Scale**.
-   **OS Integration**: Respect system-wide font size preferences (e.g., iOS Dynamic Type) and adjust tracking/leading dynamically.

### 1.4 Cognitive Load Management
-   **Centralization**: Cluster critical information centrally to minimize orbital eye movement (Motor Conservation Hypothesis).
-   **Front-Loading**: Assume an **F-Pattern** for text-heavy layouts; place critical keywords at the start of sentences and paragraphs.
-   **Dual Coding**: Use complementary visuals for instructions (Mayer’s Principles) but **avoid redundancy** between text and audio.

---

## 2. Core Components

### 2.1 Information Cards (The "Node")
The fundamental unit of information is the **Card**. 

-   **Structure**:
    -   **Header**: Title/Label + Icon (via `getTypeIcon`).
    -   **Body**: Summary or key metrics.
    -   **Footer**: Actions or metadata.
-   **Styling**:
    -   Use standard borders and shadows defined in `tokens.ts`.
    -   **Theme**: Apply color accents based on type (via `getTypeColor`).

### 2.2 SVG Connections (The "Edge")
-   **Implementation**: An `<svg>` overlay connects Card edges or centers.
-   **Visuals**: Use **Bezier curves** (`C` command) for organic flows and **Straight lines** for rigid hierarchies.

---

## 3. Standard Layouts

### A. Mind Map (Horizontal Hierarchy)
-   **Flow**: Left (Root) -> Right (Leaves).
-   **Nodes**: Rounded Cards.
-   **Edges**: Curved Bezier lines.

### B. Concept Grid
-   **Layout**: CSS Grid or Masonry.
-   **Interaction**: Filter and Sort.

### C. Flow (Process)
-   **Nodes**: Cards with status indicators and directional SVG markers.

---

## 4. Utility Helpers

### 1. `getTypeIcon`
Maps entity types to Lucide React icons (e.g., `Layers` for Concepts, `Globe` for Organizations, `Cpu` for Tech).

### 2. `getTypeColor`
Maps entity types to Tailwind color themes (e.g., Purple for Concept, Blue for Organization, Green for Person).

### 3. `unwrapDynamo`
Recursively transforms raw DynamoDB JSON into standard JavaScript objects.

---

## 5. Dynamic Content & Video
-   **Kinetic Captions**: For short-form video, use synchronized, moving captions.
-   **Chunking**: Display text in visual chunks of **3–7 words**.
-   **Safety Zones**: Place captions outside platform UI occlusion zones.
