# UI Structure Documentation - Resume Edit Form

This document outlines the standardized UI structure and styling for the form sections in `app/(dashboard)/user/edit/page.tsx`, based on the updated design in **Step 1 (Personal Details)**. This serves as a reference for aligning all other steps (2-6) to the same premium aesthetic.

## 1. Step Transition & Animation
Each step is wrapped in a `motion.div` for smooth entry:
```tsx
<motion.div
  key={currentStep}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="space-y-6"
>
  {/* Step Content */}
</motion.div>
```

## 2. Layout Grid
Use a responsive grid for fields to maintain consistency:
- **Container Class**: `grid grid-cols-1 md:grid-cols-2 gap-6 pl-4`
- **Single Column (if needed)**: `space-y-6 pl-4`

## 3. Form Field Structure
Each input field should follow this nested structure:
```tsx
<div className="space-y-1">
  <label className="text-md px-2 font-semibold text-slate-700">
    Field Label
  </label>
  <input
    value={...}
    onChange={...}
    className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
    placeholder="..."
  />
</div>
```

## 4. Components & Styling Tokens

### Labels
- **Class**: `text-md px-2 font-semibold text-slate-700`
- **Optional Required Mark**: `<span className="text-rose-500 ml-1">*</span>`

### Input Fields
- **Base Style**: `w-full bg-white border rounded-sm border-slate-300 px-4 py-3`
- **Bottom Border**: `border-b border-gray-300`
- **Transitions**: `transition-all duration-200`
- **Focus State**: `focus:outline-none focus:border-b-2 focus:border-[var(--primary)]`
- **Placeholder**: `placeholder:text-slate-300`

### Select Fields
- Inherit the same base styling as Inputs.
- **Class**: `w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] text-slate-700`

### Textareas
- Should follow the same premium pattern but with adjustable height.
- **Class**: `w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[150px] resize-none`

## 5. Interaction Patterns
- **Hover**: Subtle transition already included in `transition-all`.
- **Focus**: Clear visual feedback via bottom border thickness increase and color change to `--primary`.
- **Empty States**: Placeholders should be light (`text-slate-300`).

---
*Note: This structure is currently implemented in Step 1 (lines 768-852) and should be propagated to Steps 2, 3, 4, 5, and 6.*
