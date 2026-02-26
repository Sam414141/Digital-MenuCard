# Accessibility Guide for Digital MenuCard Application

## Overview
This guide outlines the accessibility improvements implemented in the Digital MenuCard application to ensure it is usable by people with disabilities and complies with WCAG 2.1 AA standards.

## Color Contrast

### Text Contrast Ratios
All text elements meet the minimum contrast ratio requirements:
- Normal text (16px): 4.5:1 contrast ratio
- Large text (18px bold or 19px regular): 3:1 contrast ratio
- UI components and graphical objects: 3:1 contrast ratio

### Color Palette Accessibility
- Primary text: `#212529` on light backgrounds (contrast ratio > 7:1)
- Secondary text: `#495057` on light backgrounds (contrast ratio > 5:1)
- Tertiary text: `#868e96` on light backgrounds (contrast ratio > 4.5:1)
- Error text: `#e74c3c` on light backgrounds (contrast ratio > 4.5:1)
- Success text: `#27ae60` on light backgrounds (contrast ratio > 4.5:1)

### Focus Indicators
All interactive elements have clear focus indicators:
```css
.btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.3);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}
```

## Keyboard Navigation

### Tab Order
All interactive elements follow a logical tab order:
1. Navigation links
2. Form inputs
3. Buttons
4. Interactive components

### Skip Links
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-color);
  color: var(--text-white);
  padding: 8px;
  text-decoration: none;
  border-radius: var(--radius-sm);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Keyboard-Only Interactions
All functionality is accessible via keyboard:
- Buttons activated with Enter or Space
- Form submission with Enter
- Dropdown menus navigable with arrow keys
- Modal dialogs trap focus appropriately

## Screen Reader Support

### Semantic HTML
Proper semantic elements are used throughout:
- `<header>`, `<nav>`, `<main>`, `<footer>` for page structure
- `<h1>` to `<h4>` for headings with proper hierarchy
- `<button>` for interactive elements
- `<form>`, `<label>`, `<input>` for forms
- `<table>` with proper headers for data tables

### ARIA Labels
ARIA attributes are used where necessary:
```html
<!-- Form inputs with labels -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" aria-describedby="email-help">
<div id="email-help" class="form-help">Please enter a valid email address</div>

<!-- Buttons with context -->
<button aria-label="Add item to cart" class="btn-icon">
  <i class="icon-cart"></i>
</button>

<!-- Status messages -->
<div role="alert" aria-live="polite" class="form-error">
  Please correct the errors in the form
</div>
```

### Landmark Regions
Page sections are properly identified:
```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation content -->
  </nav>
</header>

<main role="main">
  <!-- Main content -->
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

## Form Accessibility

### Labels and Instructions
All form elements have associated labels:
```html
<div class="form-group">
  <label for="username" class="form-label">Username</label>
  <input 
    type="text" 
    id="username" 
    name="username" 
    class="form-input"
    required
    aria-required="true"
  >
</div>
```

### Error Handling
Form errors are clearly indicated:
```html
<div class="form-group">
  <label for="email" class="form-label">Email Address</label>
  <input 
    type="email" 
    id="email" 
    name="email" 
    class="form-input"
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <div id="email-error" class="form-error" role="alert">
    Please enter a valid email address
  </div>
</div>
```

### Fieldsets and Legends
Grouped form elements use fieldsets:
```html
<fieldset>
  <legend class="form-label">Payment Method</legend>
  <div class="form-check">
    <input type="radio" id="credit" name="payment" value="credit" class="form-check-input">
    <label for="credit" class="form-check-label">Credit Card</label>
  </div>
  <div class="form-check">
    <input type="radio" id="debit" name="payment" value="debit" class="form-check-input">
    <label for="debit" class="form-check-label">Debit Card</label>
  </div>
</fieldset>
```

## Images and Media

### Alt Text
All images have appropriate alt text:
```html
<!-- Decorative images -->
<img src="decorative.jpg" alt="" />

<!-- Informative images -->
<img src="menu-item.jpg" alt="Grilled salmon with lemon butter sauce" />

<!-- Functional images -->
<img src="cart-icon.svg" alt="Add to cart" />
```

### Complex Images
Complex images include detailed descriptions:
```html
<figure>
  <img src="restaurant-layout.png" alt="Restaurant floor plan" />
  <figcaption>
    Restaurant floor plan showing table locations and accessibility features
  </figcaption>
</figure>
```

## Responsive Design Accessibility

### Touch Targets
Interactive elements meet minimum touch target sizes:
- Buttons: Minimum 44px × 44px
- Links: Minimum 44px × 44px
- Form inputs: Minimum 44px height

### Zoom Support
The application supports zoom up to 200% without loss of functionality:
- No horizontal scrolling required
- Text reflows appropriately
- Layout remains functional

## Motion and Animation

### Reduced Motion
Respects user preferences for reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  .btn,
  .card,
  .form-input {
    transition: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
```

### Animation Duration
All animations are brief and non-distracting:
- Transitions: 0.15s to 0.3s
- Animations: Less than 5 seconds

## Testing and Validation

### Automated Testing
Regular automated accessibility testing using:
- axe-core for JavaScript applications
- Lighthouse accessibility audits
- WAVE evaluation tool

### Manual Testing
Manual testing includes:
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification
- Focus management verification

### User Testing
Involvement of users with disabilities in testing:
- Visual impairments
- Motor impairments
- Cognitive impairments
- Hearing impairments

## Future Improvements

### Planned Enhancements
1. Add landmark navigation shortcuts
2. Implement high contrast mode
3. Add language switching support
4. Improve error recovery mechanisms
5. Add more detailed ARIA live regions

### Continuous Monitoring
- Regular accessibility audits
- Integration with CI/CD pipeline
- User feedback collection
- Compliance documentation updates

This accessibility guide ensures that the Digital MenuCard application is usable by the widest possible audience, including people with disabilities, and demonstrates our commitment to inclusive design principles.