---
name: game-component-design
description: Design system for the Windsurf vs All game - covers color palettes, typography, shapes, spacing, and component patterns for a simple, fun, modern aesthetic
---

# Game Component Design Guide

This skill codifies the design system for the Windsurf vs All game. Follow these guidelines when creating or modifying UI components, game elements, and visual styling.

---

## Design Philosophy

The design should feel **simple, fun, and modern**. Key principles:

- **Approachable**: Clean visuals that don't overwhelm—players should focus on gameplay, not UI clutter
- **Playful**: Bright, saturated colors and smooth rounded shapes create a friendly, casual vibe
- **Responsive**: Smooth transitions (0.3s standard) make interactions feel polished and alive
- **Unobtrusive**: UI overlays use transparency to stay visible without blocking the game

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Teal** | `#008080` | Player cell color |
| **Green** | `#4CAF50` | Success states, player highlights, active toggles |
| **Amber** | `#FFC107` | Warnings, section headers, top player indicator |
| **Red** | `#f44336` | Danger actions (restart), hover: `#da190b` |

### UI Colors
| Name | Value | Usage |
|------|-------|-------|
| **Overlay Background** | `rgba(0, 0, 0, 0.7)` | Panels, minimap, leaderboard |
| **Panel Background** | `rgba(0, 0, 0, 0.9)` | Settings panel |
| **Subtle Border** | `rgba(255, 255, 255, 0.1)` | Dividers within panels |
| **Minimap Border** | `rgba(255, 255, 255, 0.3)` | Minimap outline |

### Theme Colors
| Theme | Background | Canvas |
|-------|------------|--------|
| **Light** | `#f0f0f0` | `white` |
| **Dark** | `#1a1a1a` | `#2d2d2d` |

### Dynamic Colors
- **Food & AI cells**: Generated via HSL for variety
  - Food: `hsl(random 0-360, 50%, 50%)`
  - AI players: `hsl(random 0-360, 70%, 50%)` (more saturated for visibility)

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| **Score display** | Arial, sans-serif | 20px | normal | `#333` (light) / `#fff` (dark) |
| **Leaderboard title** | Arial, sans-serif | 16px | normal | white |
| **Leaderboard items** | Arial, sans-serif | 14px | normal | white |
| **Panel headings (h2)** | Arial, sans-serif | 18px | normal | `#4CAF50` |
| **Section headings (h3)** | Arial, sans-serif | 16px | normal | `#FFC107` |
| **Control items** | Arial, sans-serif | 14px | normal | white |
| **Cell names (canvas)** | Arial | 12-20px (scales with cell) | bold | white with black stroke |

### Text Effects
- **Score**: `text-shadow: 0 0 3px rgba(255, 255, 255, 0.5)` (light) / `rgba(0, 0, 0, 0.5)` (dark)
- **Cell names**: Black stroke outline (`lineWidth: 3`) for readability on any background

---

## Shapes & Geometry

### Game Elements
| Element | Shape | Size |
|---------|-------|------|
| **Cells** | Circle | Radius scales with score via `getSize()` |
| **Food** | Circle | Fixed 5px radius |
| **Minimap dots** | Circle | Player: 3px, Others: 2px |

### UI Elements
| Element | Border Radius | Notes |
|---------|---------------|-------|
| **Leaderboard** | 5px | Subtle rounding |
| **Minimap** | 5px | Matches leaderboard |
| **Settings icon** | 50% (circle) | 40x40px clickable area |
| **Settings panel** | 10px | Larger radius for modal feel |
| **Buttons** | 4px | Compact, clickable |
| **Toggle switch** | 24px (pill shape) | 44x24px total size |

---

## Spacing & Layout

### Standard Spacing
- **Edge padding**: 10-20px from viewport edges
- **Panel padding**: 20px internal
- **Item margins**: 5px vertical between list items
- **Section dividers**: 15px padding with 1px border

### Positioning
| Element | Position |
|---------|----------|
| Score | Top-left (10px, 10px) |
| Leaderboard | Top-right (10px, 10px) |
| Minimap | Bottom-left (20px, 20px) |
| Settings | Bottom-right (20px, 20px) |

---

## Transitions & Animation

### Standard Timing
- **Default transition**: `0.3s` for color changes, opacity, transforms
- **Toggle switch**: `0.4s` for smooth sliding

### Animation Patterns
- **Panel reveal**: Scale from 0.95 → 1.0 with opacity fade
- **Hover states**: Darken background (e.g., `rgba(0,0,0,0.7)` → `0.9`)
- **Theme switching**: Smooth background-color transition

---

## Component Patterns

### Overlay Panels
```css
background-color: rgba(0, 0, 0, 0.7-0.9);
color: white;
padding: 10-20px;
border-radius: 5-10px;
font-family: Arial, sans-serif;
```

### Interactive Buttons
```css
background-color: #4CAF50;
color: white;
border: none;
padding: 8px 16px;
border-radius: 4px;
cursor: pointer;
transition: background-color 0.3s;
```

### Toggle Switches
- Pill-shaped track (44x24px)
- Circular knob (18px) with smooth translateX animation
- Active state: green (`#4CAF50`)

---

## Accessibility Notes

- Maintain sufficient contrast between text and backgrounds
- Use `text-shadow` or stroke outlines for text over dynamic backgrounds
- Ensure clickable areas are at least 40x40px
- Support both light and dark themes via CSS custom properties
