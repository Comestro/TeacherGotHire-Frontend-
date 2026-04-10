# PTP Institute Modernization Design System (2026)

This document outlines the premium design system and UX principles implemented for the PTP Institute portal modernization.

## Core Principles
1. **Institutional Teal Aesthetic**: Transitioned from generic blue to a sophisticated "Teal" palette representing authority and freshness.
2. **Instant UX (No-Motion Policy)**: Removed all `framer-motion`, `@keyframes`, and CSS transitions to achieve instantaneous interactions, critical for Android WebView performance.
3. **Editorial Typography**: Using high-contrast font weights and leading-relaxed spacing for a premium, editorial grade feel.
4. **Tonal Layering**: Utilizing subtle background shifts (Slate-50 to White) and refined border tokens (1px Slate-200) instead of heavy shadows.

## Color Palette
| Token | Value | usage |
|-------|-------|-------|
| Primary | `#0D9488` (Teal-600) | Primary Buttons, Active States, Logo |
| Secondary | `#64748B` (Slate-500) | Captions, Subheaders |
| Background | `#F8FAFC` (Slate-50) | Global Page Background |
| Surface | `#FFFFFF` | Cards, Header, Inputs |
| Border | `#E2E8F0` (Slate-200) | Component Outlines |

## Component Specs

### 1. Universal Header
- **Height**: 64px (h-16)
- **Blur**: `backdrop-blur-md` (where supported)
- **Role Awareness**: Switches between Guest, Teacher, Recruiter, and Admin modes dynamically.
- **Mobile Optimization**: Condenses logo to "PTP I" and uses icon-only search to prevent overcrowding.

### 2. Premium Cards (`card-premium`)
- **Radius**: `2rem` (rounded-[2rem])
- **Shadow**: `shadow-2xl shadow-slate-200/50`
- **Border**: `1px border-slate-100`

### 3. Navigation Layouts
- **Sidebar**: Sticky/Fixed with Slate-50 gradient backgrounds.
- **Header**: Sticky `top-0` with standard `z-50` depth.
- **Main Content**: `max-w-7xl` or `max-w-8xl` centering with `px-4`.

## Deployment Branches
- **Branch**: `design-modernization`
- **Status**: Active Implementation
- **Goal**: Full project parity for Web and Android.

---
*Verified by Antigravity Design Team (Google DeepMind)*
