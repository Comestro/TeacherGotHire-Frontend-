# PTP Institute Modernization Design System (2026)

This document outlines the **Minimalist Premium** design system and UX principles implemented for the PTP Institute portal modernization.

## Core Principles
1. **Institutional Teal Aesthetic**: Sophisticated solid Teal palette for a clean, stable professional image.
2. **Instant UX (No-Motion Policy)**: Zero animations/transitions/gradients for maximum performance and clarity.
3. **Minimalist Surface Design**: 
   - **No Shadows**: Components rely on high-precision borders (`1px`) for depth.
   - **Reduced Radius**: Transitioned from circular to conservative `rounded-xl` (12px) or `rounded-2xl` (16px) for a sharper professional look.
   - **Solid Colors**: Removal of all gradients to ensure consistent rendering across all device types.
4. **Editorial Typography**: High-contrast font weights and precise tracking for a structured, publication-grade layout.

## Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0D9488` (Teal-600) | Brand colors, Primary Buttons, Active States |
| Secondary | `#64748B` (Slate-500) | Secondary text, captions, inactive icons |
| Background | `#F8FAFC` (Slate-50) | Global application background |
| Surface | `#FFFFFF` | Main UI elements (Cards, Modals, Headers) |
| Border | `#CBD5E1` (Slate-300) | High-definition component outlines |

## Component Specs

### 1. Universal Header
- **Height**: 64px (h-16)
- **Border**: `border-b border-slate-200`
- **Surface**: Pure solid white (`bg-white`)
- **Depth**: Zero shadow, relies on border separation.

### 2. Standard Cards (`card-minimal`)
- **Radius**: `rounded-xl` (12px)
- **Shadow**: `shadow-none`
- **Border**: `1px border-slate-200` (consistent thickness)
- **Padding**: Focused on spacing efficiency (`p-6` for desktop, `p-4` for mobile).

### 3. Sidebar Navigation
- **Architecture**: Fixed width (`260px`) with high contrast separation.
- **Header**: High-density brand area with solid teal logo block.
- **Items**: Tonal active states (`bg-slate-100`) with no transition effects.

## UI Philosophy: "Flat Authority"
The system prioritizes functional density and visual clarity. By removing "fluff" like heavy gradients and deep shadows, the interface becomes a high-performance tool tailored for educational institutions.

---
*Verified by Antigravity Design Team (Google DeepMind)*
