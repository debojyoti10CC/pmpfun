# Neobrutalist Design Implementation

## Overview
The Stellar Pump launchpad has been transformed with an aggressive neobrutalist design that emphasizes:

- **Bold, high-contrast colors** (black, white, yellow, pink, cyan, green, red, orange)
- **Thick black borders** on all elements
- **Heavy drop shadows** for depth
- **Rotated elements** for dynamic, chaotic feel
- **Uppercase typography** with Space Grotesk and JetBrains Mono fonts
- **Chunky buttons** with hover animations
- **Raw, unpolished aesthetic** that screams "crypto punk"

## Key Design Elements

### Color Palette
- **Primary Black**: `#000000` - Used for borders, text, and shadows
- **Pure White**: `#ffffff` - Background and contrast elements
- **Electric Yellow**: `#ffff00` - Primary accent color
- **Hot Pink**: `#ff00ff` - Secondary accent
- **Cyan**: `#00ffff` - Info elements
- **Lime Green**: `#00ff00` - Success states
- **Pure Red**: `#ff0000` - Danger/error states
- **Orange**: `#ff8800` - Warning states

### Typography
- **Headers**: Space Grotesk (900 weight, uppercase, letter-spaced)
- **Body Text**: JetBrains Mono (monospace for that terminal feel)
- **All text is UPPERCASE** for maximum impact

### Components

#### Cards (`neo-card`)
- 6px black borders
- 12px drop shadows
- Slight rotation (-1° to 3°)
- Hover effects with shake animation

#### Buttons (`neo-btn`)
- Chunky 4px borders
- 6px drop shadows
- Uppercase text with letter spacing
- Hover effects with transform and shadow changes
- Color variants for different states

#### Inputs (`neo-input`)
- Monospace font
- 4px borders with shadows
- Focus states with yellow background
- Slight rotation for organic feel

#### Progress Bars (`neo-progress`)
- Chunky 32px height
- Black borders and shadows
- Green fill with black border

### Animations
- **Bounce**: Subtle bouncing for hero elements
- **Shake**: Aggressive shake on hover/error states
- **Glitch**: Subtle glitch effect for dynamic elements
- **Pulse**: Shadow pulsing for emphasis
- **Wiggle**: Gentle rotation animation

### Layout
- **Grid-based** with generous spacing
- **Rotated cards** for dynamic composition
- **Sticky elements** for functional UX
- **Responsive** with mobile optimizations

## Implementation Details

### CSS Classes
- `.neo-container` - Main container
- `.neo-card` - Basic card component
- `.neo-card-yellow/pink/cyan` - Colored card variants
- `.neo-btn` - Button component
- `.neo-btn-primary/danger/success/info` - Button variants
- `.neo-input` - Input field styling
- `.neo-title` - Large heading text
- `.neo-subtitle` - Medium heading text
- `.neo-text` - Body text
- `.neo-flex` - Flexbox utility
- `.neo-grid` - Grid utility
- `.neo-progress` - Progress bar container
- `.neo-progress-bar` - Progress bar fill

### Responsive Design
- Mobile-first approach
- Reduced rotations on small screens
- Smaller fonts and spacing
- Simplified animations for performance

### Accessibility
- High contrast ratios maintained
- Focus states clearly defined
- Screen reader friendly structure
- Keyboard navigation support

## Usage Examples

```tsx
// Hero section with bounce animation
<div className="neo-card neo-card-yellow p-12 text-center transform rotate-neo-2 neo-bounce">
  <h1 className="neo-title mb-8">STELLAR PUMP</h1>
</div>

// Primary button with shake effect
<button className="neo-btn neo-btn-primary neo-shake">
  CREATE TOKEN
</button>

// Info card with rotation
<div className="neo-card neo-card-cyan p-6 transform rotate-neo-1">
  <h3 className="neo-subtitle">INFORMATION</h3>
</div>
```

## Philosophy
This neobrutalist design embraces the raw, unpolished aesthetic of early web design while maintaining modern usability. It's intentionally aggressive and attention-grabbing, perfect for a memecoin launchpad that needs to stand out in the crowded DeFi space.

The design rejects minimalism in favor of maximum visual impact, using every tool available - color, typography, shadows, borders, and animations - to create an unforgettable user experience that screams "crypto punk" energy.