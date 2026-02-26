# Responsive Design Guidelines

## Overview
This document outlines the responsive design system implemented for the Digital Menu Card application. The system ensures optimal user experience across all device sizes and orientations.

## Breakpoints

### Mobile First Approach
- **Extra Small (xs)**: 0px - 374px (Phones)
- **Small (sm)**: 375px - 575px (Phones)
- **Medium (md)**: 576px - 767px (Tablets)
- **Large (lg)**: 768px - 991px (Small laptops)
- **Extra Large (xl)**: 992px - 1199px (Desktops)
- **Extra Extra Large (xxl)**: 1200px+ (Large desktops)

### Desktop First Approach
- **Large Desktops**: 1400px+
- **Extra Large Desktops**: 1600px+
- **Ultra Wide Screens**: 1900px+

## Responsive Utilities

### Grid System
The application uses a flexible grid system with the following classes:
- `.grid-responsive` - Base grid container
- `.grid-cols-auto` - Auto-fit columns
- `.grid-cols-{n}-{breakpoint}` - Specific column counts at breakpoints

### Visibility Classes
- `.hide-{breakpoint}` - Hide elements at specific breakpoints
- `.show-{breakpoint}` - Show elements at specific breakpoints

### Width/Height Utilities
- `.w-{breakpoint}-{percentage}` - Width utilities
- `.h-{breakpoint}-{percentage}` - Height utilities

### Spacing Utilities
- `.p-{breakpoint}-{size}` - Padding utilities
- `.m-{breakpoint}-{size}` - Margin utilities

### Flexbox Utilities
- `.flex-{direction}-{breakpoint}` - Flex direction utilities
- `.align-items-{alignment}-{breakpoint}` - Alignment utilities
- `.justify-content-{alignment}-{breakpoint}` - Justification utilities

## Device-Specific Optimizations

### Touch Devices
- Increased touch targets (minimum 44px)
- Touch-friendly navigation
- Simplified interactions

### Hover Devices
- Enhanced hover effects
- Detailed tooltips
- Advanced interactions

## Accessibility Features

### High Contrast Mode
- Support for `prefers-contrast: high`
- Enhanced visibility for visually impaired users

### Reduced Motion
- Support for `prefers-reduced-motion: reduce`
- Disabled animations for users with motion sensitivity

### Dark Mode
- Support for `prefers-color-scheme: dark`
- Automatic theme switching based on system preference

## Orientation Handling

### Portrait Mode
- Vertical layouts optimized for handheld devices
- Larger touch targets
- Simplified navigation

### Landscape Mode
- Horizontal layouts for wider screens
- Multi-column content
- Enhanced productivity features

## Print Styles
- `.no-print` - Hide elements when printing
- `.print-only` - Show elements only when printing
- Optimized typography for printed media

## Testing Guidelines

### Device Testing
1. Test on actual devices when possible
2. Use browser dev tools for simulation
3. Verify touch interactions
4. Check orientation changes

### Performance Testing
1. Monitor loading times on mobile networks
2. Optimize images for different resolutions
3. Minimize CSS/JS bundle sizes
4. Test with slow network conditions

## Best Practices

### Images
- Use responsive image techniques (`srcset`, `sizes`)
- Optimize for different DPI screens
- Implement lazy loading for off-screen images

### Typography
- Use relative units (rem, em) for scalable text
- Maintain readable line lengths (45-75 characters)
- Ensure adequate contrast ratios

### Navigation
- Implement hamburger menus for small screens
- Use sticky headers for easy access
- Provide clear visual hierarchy

### Forms
- Optimize input sizes for touch
- Use appropriate input types
- Provide clear error messaging

## Implementation Notes

### CSS Custom Properties
All responsive values use CSS custom properties defined in `theme.css` for consistency:
- Spacing variables (`--spacing-{size}`)
- Font sizing (`--font-size-{size}`)
- Border radius (`--radius-{size}`)
- Shadows (`--shadow-{size}`)

### JavaScript Considerations
- Use `window.matchMedia()` for JavaScript-based responsive logic
- Debounce resize events to prevent performance issues
- Consider server-side rendering implications

## Future Enhancements

### Container Queries
Plan to implement container queries for more granular control as browser support improves.

### Adaptive Components
Develop components that adapt their behavior based on available space rather than viewport size.

### Performance Monitoring
Implement performance monitoring for different device categories to ensure optimal experience.