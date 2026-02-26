# Professional Restaurant App Design Guidelines

## Color Palette

### Primary Colors
- **Primary**: `#2c3e50` (Deep navy blue) - Main brand color
- **Primary Dark**: `#1a2530` - For depth and hover states
- **Primary Light**: `#34495e` - For highlights and accents

### Secondary Colors
- **Secondary**: `#e74c3c` (Professional red) - For accents and important actions
- **Secondary Light**: `#ff6b6b` - For hover states
- **Secondary Dark**: `#c0392b` - For depth

### Neutral Colors
- **Light Backgrounds**: `#f8f9fa` to `#e9ecef`
- **Text Colors**: `#212529` (primary), `#495057` (secondary), `#868e96` (tertiary)
- **Borders**: `#dee2e6` to `#ced4da`

### Status Colors
- **Success**: `#27ae60` (Green)
- **Warning**: `#f39c12` (Orange)
- **Error**: `#e74c3c` (Red)
- **Info**: `#3498db` (Blue)

## Typography

### Font Family
- **Primary**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Monospace**: `SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`

### Font Sizes
- **Display**: `3.75rem` (6xl)
- **Heading 1**: `3rem` (5xl)
- **Heading 2**: `2.25rem` (4xl)
- **Heading 3**: `1.875rem` (3xl)
- **Heading 4**: `1.5rem` (2xl)
- **Large**: `1.25rem` (xl)
- **Base**: `1rem` (base)
- **Small**: `0.875rem` (sm)
- **Extra Small**: `0.75rem` (xs)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Spacing System
- **1**: `0.25rem` (4px)
- **2**: `0.5rem` (8px)
- **3**: `0.75rem` (12px)
- **4**: `1rem` (16px)
- **5**: `1.25rem` (20px)
- **6**: `1.5rem` (24px)
- **8**: `2rem` (32px)
- **10**: `2.5rem` (40px)
- **12**: `3rem` (48px)

## Border Radius
- **Extra Small**: `4px`
- **Small**: `6px`
- **Medium**: `8px`
- **Large**: `12px`
- **Extra Large**: `16px`
- **2XL**: `24px`
- **Full**: `9999px`

## Shadows
- **XS**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **SM**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **MD**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **LG**: `0 10px 15px rgba(0, 0, 0, 0.1)`
- **XL**: `0 20px 25px rgba(0, 0, 0, 0.1)`
- **2XL**: `0 25px 50px rgba(0, 0, 0, 0.15)`

## Transitions
- **Fast**: `0.15s ease`
- **Normal**: `0.2s ease`
- **Slow**: `0.3s ease`

## Component Guidelines

### Buttons
1. Use consistent padding: `var(--spacing-3) var(--spacing-6)`
2. Apply `border-radius: var(--radius-md)`
3. Use appropriate color variables for different button types
4. Include hover and active states with transforms and shadow changes
5. Always include focus states for accessibility

### Cards
1. Use `border-radius: var(--radius-lg)`
2. Apply `box-shadow: var(--shadow-md)`
3. Include hover states with subtle elevation
4. Use consistent padding: `var(--spacing-6)`

### Forms
1. Inputs should have `border-radius: var(--radius-md)`
2. Use consistent padding: `var(--spacing-3) var(--spacing-4)`
3. Apply proper focus states with border color and box-shadow
4. Use appropriate font sizes and line heights

### Navigation
1. Maintain consistent height (70px desktop, 60px mobile)
2. Use `box-shadow: var(--shadow-md)` for depth
3. Apply consistent hover states for navigation items
4. Ensure mobile responsiveness with hamburger menu

## Responsive Breakpoints
- **Large**: `1024px` and above
- **Medium**: `768px` to `1023px`
- **Small**: `480px` to `767px`
- **Extra Small**: Below `480px`

## Accessibility
1. Ensure color contrast ratios of at least 4.5:1
2. Include focus indicators for interactive elements
3. Use semantic HTML elements
4. Provide proper alt text for images
5. Ensure keyboard navigation support