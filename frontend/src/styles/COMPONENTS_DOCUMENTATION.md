# Professional UI Components Library Documentation

## Overview
This document provides documentation for the professional UI components library implemented in the Digital MenuCard application. All components follow a consistent design system with unified styling, spacing, and responsive behavior.

## Button Components

### Base Button
The base button component provides the foundation for all button variations.

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-normal);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  outline: none;
  position: relative;
  overflow: hidden;
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-sm);
}
```

### Button Variations

#### Primary Button
Used for primary actions and calls to action.

```css
.btn-primary {
  background: var(--primary-gradient);
  color: var(--text-white);
  border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
Used for secondary actions and alternative options.

```css
.btn-secondary {
  background: var(--bg-white);
  color: var(--primary-color);
  border-color: var(--border-medium);
  box-shadow: var(--shadow-xs);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--neutral-100);
  border-color: var(--border-dark);
  box-shadow: var(--shadow-sm);
}
```

#### Success Button
Used for positive actions like confirmation or completion.

```css
.btn-success {
  background: var(--status-success);
  color: var(--text-white);
  border-color: var(--status-success);
}

.btn-success:hover:not(:disabled) {
  background: #219653;
  border-color: #219653;
  box-shadow: var(--shadow-md);
}
```

#### Warning Button
Used for cautionary actions that require user attention.

```css
.btn-warning {
  background: var(--status-warning);
  color: var(--text-white);
  border-color: var(--status-warning);
}

.btn-warning:hover:not(:disabled) {
  background: #d35400;
  border-color: #d35400;
  box-shadow: var(--shadow-md);
}
```

#### Error Button
Used for destructive actions like deletion or cancellation.

```css
.btn-error {
  background: var(--status-error);
  color: var(--text-white);
  border-color: var(--status-error);
}

.btn-error:hover:not(:disabled) {
  background: #c0392b;
  border-color: #c0392b;
  box-shadow: var(--shadow-md);
}
```

#### Outline Button
Used for less prominent actions that should not draw too much attention.

```css
.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: none;
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary-color);
  color: var(--text-white);
  box-shadow: var(--shadow-sm);
}
```

#### Icon Button
Used for actions represented by icons only.

```css
.btn-icon {
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-primary);
  box-shadow: none;
}

.btn-icon:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--primary-color);
}
```

### Button Sizes

#### Small Button
```css
.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
}
```

#### Large Button
```css
.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-lg);
}
```

#### Block Button
```css
.btn-block {
  width: 100%;
}
```

## Card Components

### Base Card
The base card component provides a container for content with consistent styling.

```css
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Card Sections

#### Card Header
```css
.card-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}
```

#### Card Body
```css
.card-body {
  padding: var(--spacing-6);
}
```

#### Card Footer
```css
.card-footer {
  padding: var(--spacing-6);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}
```

## Typography Components

### Headings

#### Display Heading
```css
.text-display {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
}
```

#### H1 Heading
```css
.text-h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.01em;
}
```

#### H2 Heading
```css
.text-h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-snug);
}
```

#### H3 Heading
```css
.text-h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}
```

#### H4 Heading
```css
.text-h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}
```

### Body Text

#### Regular Body Text
```css
.text-body {
  color: var(--text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}
```

#### Small Text
```css
.text-small {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}
```

#### Muted Text
```css
.text-muted {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}
```

## Form Components

### Form Groups
```css
.form-group {
  margin-bottom: var(--spacing-5);
}
```

### Form Labels
```css
.form-label {
  display: block;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}
```

### Form Inputs
```css
.form-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-white);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-xs);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}
```

### Form Select
```css
.form-select {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-white);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-xs);
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}
```

### Form Textarea
```css
.form-textarea {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-white);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-xs);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}
```

### Form Help Text
```css
.form-help {
  display: block;
  margin-top: var(--spacing-2);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
```

### Form Error Text
```css
.form-error {
  display: block;
  margin-top: var(--spacing-2);
  color: var(--status-error);
  font-size: var(--font-size-sm);
}
```

### Checkbox and Radio
```css
.form-check {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.form-check-input {
  width: auto;
  margin: 0;
}

.form-check-label {
  font-weight: var(--font-weight-normal);
  cursor: pointer;
}
```

## Layout Components

### Container
```css
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: var(--spacing-6);
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

### Flexbox System
```css
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.items-center { align-items: center; }
.items-start { align-items: flex-start; }
```

## Utility Classes

### Spacing
```css
/* Margin */
.m-0 { margin: 0; }
.m-1 { margin: var(--spacing-1); }
.m-2 { margin: var(--spacing-2); }
.m-3 { margin: var(--spacing-3); }
.m-4 { margin: var(--spacing-4); }
.m-5 { margin: var(--spacing-5); }
.m-6 { margin: var(--spacing-6); }

/* Padding */
.p-0 { padding: 0; }
.p-1 { padding: var(--spacing-1); }
.p-2 { padding: var(--spacing-2); }
.p-3 { padding: var(--spacing-3); }
.p-4 { padding: var(--spacing-4); }
.p-5 { padding: var(--spacing-5); }
.p-6 { padding: var(--spacing-6); }
```

### Borders
```css
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }

.border { border: 1px solid var(--border-medium); }
.border-light { border: 1px solid var(--border-light); }
```

### Shadows
```css
.shadow-xs { box-shadow: var(--shadow-xs); }
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
```

### Text Alignment
```css
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
```

### Font Weights
```css
.font-bold { font-weight: var(--font-weight-bold); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-medium { font-weight: var(--font-weight-medium); }
```

## Responsive Utilities

### Breakpoints
- Desktop: 1024px and above
- Tablet: 768px to 1023px
- Mobile: Below 768px
- Small Mobile: Below 480px

### Responsive Classes
```css
/* Desktop Only */
@media (min-width: 1024px) {
  .desktop-only { display: block; }
  .mobile-only { display: none; }
}

/* Mobile Only */
@media (max-width: 1023px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
}
```

## Usage Guidelines

### Consistency
- Always use the defined CSS variables for colors, spacing, and typography
- Follow the established patterns for component styling
- Maintain consistent spacing using the defined scale

### Accessibility
- Ensure proper color contrast ratios (at least 4.5:1 for normal text)
- Use semantic HTML elements where appropriate
- Include focus states for interactive elements
- Provide proper alt text for images

### Performance
- Minimize CSS bloat by only including necessary components
- Use efficient selectors
- Optimize for mobile performance

This component library ensures a consistent, professional appearance across the entire application while maintaining flexibility for future enhancements.