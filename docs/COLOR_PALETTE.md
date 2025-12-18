# Color Palette & Theming Guide 🎨

This document describes the new color palette and theme tokens for the project. Use the provided CSS variables and Tailwind mappings to keep the UI consistent across all pages.

---

## Purpose

- Provide a single source of truth for colors and status semantics.
- Encourage usage of CSS variables (in `:root`) via Tailwind tokens configured in `tailwind.config.js`.
- Make it easy to theme new pages and components to match the Resumes page look-and-feel.

---

## Palette Reference

These colors are derived from the uploaded design system image:

### Core Colors
- **Background**: `white` / `light`
- **Foreground**: `black` / `dark`
- **Border**: `light-grey`
- **Input**: `light-grey`

### Primary & Secondary
- **Primary**: `blue` (Brand)
- **Primary Foreground**: `white`
- **Secondary**: `light-blue/grey`
- **Secondary Foreground**: `blue/dark`

### Status
- **Success**: `green`
- **Success Foreground**: `white`
- **Warning**: `orange`
- **Warning Foreground**: `white`
- **Destructive**: `red`
- **Destructive Foreground**: `white`
- **Muted**: `light-grey`
- **Muted Foreground**: `grey`

### Accents & Surfaces
- **Accent**: `blue`
- **Accent Foreground**: `white`
- **Card**: `white`
- **Card Foreground**: `black`
- **Sidebar**: `white`
- **Sidebar Foreground**: `grey/dark`
- **Sidebar Primary**: `light-grey`
- **Sidebar Primary Foreground**: `black`

### Border Radius
- **Small**: `4px`
- **Medium**: `8px`
- **Large**: `12px`
- **Very Large**: `24px`

---

## Usage Guidelines

- Use semantic variable names (e.g., `bg-primary`, `text-primary-foreground`) instead of hardcoded hex values.
- Adhere to the defined border radii for consistent component shaping.

