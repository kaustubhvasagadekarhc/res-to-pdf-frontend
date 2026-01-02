# Vettly Frontend - Complete Styling Guide

This document provides a comprehensive overview of all styling values, design tokens, and design system elements used in the Vettly frontend application.

---

## 📦 **Styling Framework & Libraries**

### **Primary Framework**
- **Tailwind CSS** v3.4.0 - Main CSS framework
- **PostCSS** v8.4.0 - CSS processing
- **Autoprefixer** v10.4.0 - Vendor prefixing

### **Animation Library**
- **Framer Motion** v12.23.24 - Animations and transitions

### **Icon Libraries**
- **Lucide React** v0.460.0 - Primary icon library (all icons imported from `lucide-react`)
- Custom icon components:
  - `@/components/icon/linked-in-icon.tsx`
  - `@/components/icon/indeed-icon.tsx`
  - `@/components/icon/naukari-icon.tsx`

### **UI Component Libraries**
- **Radix UI** - Headless UI components
  - `@radix-ui/react-progress` v1.1.7
  - `@radix-ui/react-slot` v1.2.3
- **Headless UI** v2.2.9 - Unstyled accessible components
- **Class Variance Authority** v0.7.1 - Component variant management

### **Utility Libraries**
- **clsx** v2.1.0 - Conditional class names
- **tailwind-merge** v2.5.0 - Merge Tailwind classes

---

## 🎨 **Color Theme**

### **Primary Colors (Blue)**
```css
primary-50:  #f0f9ff  /* Lightest blue background */
primary-100: #e0f2fe  /* Light blue background */
primary-200: #bae6fd  /* Lighter blue */
primary-300: #7dd3fc  /* Light blue accent */
primary-400: #38bdf8  /* Medium blue */
primary-500: #0ea5e9  /* Main Vettly blue (PRIMARY) */
primary-600: #0284c7  /* Darker blue (hover states) */
primary-700: #0369a1  /* Dark blue */
primary-800: #075985  /* Darker blue */
primary-900: #0c4a6e  /* Very dark blue */
primary-950: #082f49  /* Darkest blue (footer) */
```

### **Secondary Colors (Gray)**
```css
secondary-50:  #f8fafc  /* Lightest gray */
secondary-100: #f1f5f9  /* Light gray background */
secondary-200: #e2e8f0  /* Lighter gray */
secondary-300: #cbd5e1  /* Light gray border */
secondary-400: #94a3b8  /* Medium gray */
secondary-500: #64748b  /* Gray text */
secondary-600: #475569  /* Darker gray */
secondary-700: #334155  /* Dark gray */
secondary-800: #1e293b  /* Dark gray text */
secondary-900: #0f172a  /* Very dark gray */
secondary-950: #020617  /* Darkest gray */
```

### **Accent Colors (Green - Success)**
```css
accent-50:  #f0fdf4  /* Lightest green */
accent-100: #dcfce7  /* Light green background */
accent-200: #bbf7d0  /* Lighter green */
accent-300: #86efac  /* Light green */
accent-400: #4ade80  /* Medium green */
accent-500: #22c55e  /* Success green */
accent-600: #16a34a  /* Darker green */
accent-700: #15803d  /* Dark green */
accent-800: #166534  /* Darker green */
accent-900: #14532d  /* Very dark green */
accent-950: #052e16  /* Darkest green */
```

### **Vettly Brand Colors**
```css
vettly-blue:      #0ea5e9  /* Primary Vettly blue */
vettly-darkBlue:  #082f49  /* Footer dark blue */
vettly-gray:       #6b7280  /* Secondary text gray */
vettly-darkGray:  #1f2937  /* Main text color */
vettly-lightBlue: #e0f2fe  /* Light blue background */
vettly-purple:    #8b5cf6  /* Purple accent */
vettly-green:     #10b981  /* Success green */
```

### **Standard Colors**
- **Red (Error)**: `red-50` to `red-950` (Tailwind default)
- **Green (Success)**: `green-50` to `green-950` (Tailwind default)
- **Orange**: `orange-50` to `orange-950` (Tailwind default)
- **White**: `#ffffff`
- **Black**: `#000000`

---

## 📏 **Typography**

### **Font Families**
- **Primary Font**: System fonts (system-ui, -apple-system, sans-serif)
- **Arabic Font**: Cairo (Google Fonts)
  - Weights: 400 (regular), 600 (semibold), 700 (bold)
  - Variable: `--font-cairo`
  - Class: `.font-cairo`

### **Font Sizes**
```css
text-xs:    0.75rem   /* 12px - Small labels, badges */
text-sm:    0.875rem  /* 14px - Body text, descriptions */
text-base:  1rem      /* 16px - Default body text */
text-lg:    1.125rem  /* 18px - Large body text */
text-xl:    1.25rem   /* 20px - Subheadings */
text-2xl:   1.5rem    /* 24px - Section headings */
text-3xl:   1.875rem  /* 30px - Large headings */
text-4xl:   2.25rem   /* 36px - Page titles */
text-5xl:   3rem      /* 48px - Hero titles */
text-6xl:   3.75rem   /* 60px - Large hero titles */
```

### **Font Weights**
```css
font-normal:   400  /* Regular text */
font-medium:   500  /* Medium emphasis */
font-semibold: 600  /* Semibold headings */
font-bold:     700  /* Bold headings */
```

### **Line Heights**
```css
leading-tight:    1.25   /* Tight line height */
leading-snug:     1.375  /* Snug line height */
leading-normal:   1.5    /* Normal line height */
leading-relaxed:  1.625  /* Relaxed line height */
leading-loose:    2      /* Loose line height */
```

### **Text Colors**
```css
/* Primary Text */
text-gray-900:  #111827  /* Main text color */
text-gray-800:  #1f2937  /* Dark text */
text-gray-700:  #374151  /* Medium dark text */
text-gray-600:  #4b5563  /* Medium text */
text-gray-500:  #6b7280  /* Secondary text */
text-gray-400:  #9ca3af  /* Muted text */
text-gray-300:  #d1d5db  /* Light text */

/* Primary Brand Colors */
text-primary-600: #0284c7  /* Primary text */
text-primary-700: #0369a1  /* Darker primary */
text-white:      #ffffff   /* White text */
```

---

## 🔲 **Border Radius**

### **Standard Border Radius Values**
```css
rounded-none:  0px       /* No border radius */
rounded-sm:    0.125rem  /* 2px - Small elements */
rounded:       0.25rem   /* 4px - Default */
rounded-md:    0.375rem  /* 6px - Medium */
rounded-lg:    0.5rem    /* 8px - Large (buttons, inputs) */
rounded-xl:    0.75rem   /* 12px - Extra large */
rounded-2xl:   1rem      /* 16px - Cards, modals */
rounded-3xl:   1.5rem    /* 24px - Very large */
rounded-full:  9999px    /* Full circle (badges, avatars) */
```

### **Common Usage**
- **Buttons**: `rounded-lg` (8px) or `rounded-xl` (12px)
- **Inputs**: `rounded-lg` (8px) or `rounded-xl` (12px)
- **Cards**: `rounded-xl` (12px) or `rounded-2xl` (16px)
- **Badges**: `rounded-full` (circular)
- **Modals**: `rounded-2xl` (16px)

---

## 📐 **Spacing (Padding & Margin)**

### **Spacing Scale (Tailwind)**
```css
0:    0px
0.5:  0.125rem  /* 2px */
1:    0.25rem   /* 4px */
1.5:  0.375rem  /* 6px */
2:    0.5rem    /* 8px */
2.5:  0.625rem  /* 10px */
3:    0.75rem   /* 12px */
3.5:  0.875rem  /* 14px */
4:    1rem      /* 16px */
5:    1.25rem   /* 20px */
6:    1.5rem    /* 24px */
7:    1.75rem   /* 28px */
8:    2rem      /* 32px */
10:   2.5rem    /* 40px */
12:   3rem      /* 48px */
16:   4rem      /* 64px */
20:   5rem      /* 80px */
24:   6rem      /* 96px */
```

### **Common Padding Values**
```css
/* Buttons */
px-3 py-2:     /* Small buttons (12px horizontal, 8px vertical) */
px-4 py-2:     /* Medium buttons (16px horizontal, 8px vertical) */
px-6 py-3:     /* Large buttons (24px horizontal, 12px vertical) */
px-8 py-4:     /* Extra large buttons (32px horizontal, 16px vertical) */

/* Inputs */
px-4 py-2:     /* Standard inputs (16px horizontal, 8px vertical) */
px-4 py-3:     /* Large inputs (16px horizontal, 12px vertical) */
pl-11:         /* Input with icon (44px left padding) */
pr-14:         /* Input with right icon (56px right padding) */

/* Cards */
p-4:           /* Small cards (16px all sides) */
p-5:           /* Medium cards (20px all sides) */
p-6:           /* Large cards (24px all sides) */
px-4 py-3:     /* Card headers (16px horizontal, 12px vertical) */

/* Containers */
px-4:          /* Mobile container padding (16px) */
px-8:          /* Tablet container padding (32px) */
px-16:         /* Desktop container padding (64px) */
py-12:         /* Section vertical padding (48px) */
py-16:         /* Large section vertical padding (64px) */
py-24:         /* Extra large section padding (96px) */
```

### **Common Margin Values**
```css
/* Spacing between elements */
gap-2:         /* 8px gap (flex/grid) */
gap-3:         /* 12px gap */
gap-4:         /* 16px gap */
gap-6:         /* 24px gap */
gap-8:         /* 32px gap */

/* Vertical margins */
mb-2:          /* 8px bottom margin */
mb-3:          /* 12px bottom margin */
mb-4:          /* 16px bottom margin */
mb-6:          /* 24px bottom margin */
mb-8:          /* 32px bottom margin */
mb-10:         /* 40px bottom margin */
mb-12:         /* 48px bottom margin */

/* Horizontal margins */
mx-auto:       /* Center horizontally */
ml-auto:       /* Push to right */
mr-auto:       /* Push to left */
```

### **RTL-Aware Spacing Utilities**
```css
/* Padding inline (RTL-aware) */
ps-0 to ps-12:  /* Padding start (left in LTR, right in RTL) */
pe-0 to pe-12:  /* Padding end (right in LTR, left in RTL) */

/* Margin inline (RTL-aware) */
ms-0 to ms-12:  /* Margin start */
me-0 to me-12:  /* Margin end */
ms-auto:        /* Margin start auto */
me-auto:        /* Margin end auto */
```

---

## 📦 **Container Sizes**

### **Container Widths**
```css
max-w-md:    28rem   /* 448px - Small forms */
max-w-lg:    32rem   /* 512px - Medium forms */
max-w-xl:    36rem   /* 576px - Large forms */
max-w-2xl:   42rem   /* 672px - Extra large forms */
max-w-4xl:   56rem   /* 896px - Content containers */
max-w-6xl:   72rem   /* 1152px - Wide containers */
max-w-7xl:   80rem   /* 1280px - Extra wide containers */
container:   Auto    /* Responsive container with padding */
```

### **Common Container Heights**
```css
min-h-screen:    100vh     /* Full viewport height */
h-screen:       100vh     /* Full viewport height */
h-full:         100%      /* Full parent height */
h-auto:         auto      /* Auto height */
```

### **Sidebar Width**
```css
w-64:  16rem  /* 256px - Sidebar width */
```

### **Header Heights**
```css
h-9:   2.25rem  /* 36px - Small buttons */
h-10:  2.5rem   /* 40px - Default buttons */
h-11:  2.75rem  /* 44px - Medium inputs */
h-12:  3rem     /* 48px - Large buttons */
h-14:  3.5rem   /* 56px - Extra large inputs/buttons */
```

---

## 🎯 **Component-Specific Styling**

### **Buttons**

#### **Button Component (`@/components/Button.tsx`)**
```css
/* Base Styles */
rounded-lg
font-medium
transition-colors
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary-500

/* Variants */
Primary:   bg-primary-600 text-white hover:bg-primary-700
Secondary: bg-gray-100 text-gray-900 hover:bg-gray-200
Outline:   border border-gray-300 bg-transparent hover:bg-gray-50
Ghost:     hover:bg-gray-100

/* Sizes */
Small:  h-9 px-3 text-sm
Medium: h-11 px-6
Large:  h-12 px-8 text-lg
```

#### **UI Button Component (`@/components/ui/button.tsx`)**
```css
/* Base Styles */
rounded-md
text-sm
font-medium
ring-offset-background
transition-colors
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2

/* Variants */
Default:      bg-primary text-primary-foreground hover:bg-primary/90
Destructive:  bg-destructive text-destructive-foreground hover:bg-destructive/90
Outline:      border border-input bg-background hover:bg-accent
Secondary:    bg-secondary text-secondary-foreground hover:bg-secondary/80
Ghost:        hover:bg-accent hover:text-accent-foreground
Link:         text-primary underline-offset-4 hover:underline

/* Sizes */
Default: h-10 px-4 py-2
Small:   h-9 rounded-md px-3
Large:   h-11 rounded-md px-8
Icon:    h-10 w-10
```

#### **Custom Button Styles (Sign-in page example)**
```css
w-full
h-14
bg-primary-500
hover:bg-primary-600
text-white
font-semibold
rounded-xl
shadow-xl
hover:shadow-2xl
transform
transition-all
duration-300
hover:scale-[1.02]
active:scale-[0.98]
```

### **Inputs**

#### **Input Component (`@/components/Input.tsx`)**
```css
/* Base Styles */
h-11
w-full
rounded-lg
border
border-gray-300
bg-white
px-4
py-2
text-sm
placeholder:text-gray-400
focus:outline-none
focus:ring-2
focus:ring-primary-500
focus:border-transparent
disabled:cursor-not-allowed
disabled:opacity-50

/* Error State */
border-red-500
focus:ring-red-500
```

#### **Custom Input Styles (Sign-in page example)**
```css
h-14
text-base
border-2
border-gray-200
focus:border-primary-500
focus:ring-4
focus:ring-primary-500/10
hover:border-gray-300
rounded-xl
shadow-sm
hover:shadow-md
pl-11  /* With left icon */
pr-14  /* With right icon */
```

### **Cards**

#### **Card Component (`@/components/ui/card.tsx`)**
```css
/* Base Card */
rounded-lg
border
bg-card
text-card-foreground
shadow-sm

/* Card Header */
p-6
flex
flex-col
space-y-1.5

/* Card Title */
text-2xl
font-semibold
leading-none
tracking-tight

/* Card Description */
text-sm
text-muted-foreground

/* Card Content */
p-6
pt-0

/* Card Footer */
flex
items-center
p-6
pt-0
```

#### **Stat Card (`@/components/dashboard/stat-card.tsx`)**
```css
bg-white
rounded-lg
border
border-gray-200
p-6

/* Icon Background Colors */
bg-blue-50 text-blue-600
bg-green-50 text-green-600
bg-primary-50 text-primary-600
bg-orange-50 text-orange-600
```

### **Sidebar (`@/components/dashboard/Sidebar.tsx`)**
```css
/* Desktop Sidebar */
w-64
bg-white
h-screen
fixed
top-0
z-50
border-r border-gray-200  /* LTR */
border-l border-gray-200  /* RTL */

/* Logo Section */
p-4
border-b
border-gray-200

/* Navigation */
p-4
space-y-2
overflow-y-auto

/* Menu Items */
px-4
py-3
rounded-lg
transition-colors

/* Active State */
bg-primary-50
text-primary-700
font-medium

/* Inactive State */
text-gray-700
hover:bg-gray-50

/* Icons */
w-5
h-5

/* Logout Section */
p-4
border-t
border-gray-200
bg-white
```

### **Header (`@/components/dashboard/dashboard-header.tsx`)**
```css
/* Header Container */
bg-white
border-b
border-gray-200
px-5
py-[18px]
fixed
top-0
left-0
right-0
z-40
lg:pl-64  /* LTR - Account for sidebar */
lg:pr-64  /* RTL - Account for sidebar */

/* User Avatar */
w-10
h-10
rounded-full
bg-primary-100
flex
items-center
justify-center
text-primary-700
font-medium

/* Dropdown Menu */
w-48
bg-white
rounded-lg
shadow-lg
border
border-gray-200
py-1
z-50

/* Notification Badge */
min-w-[18px]
h-[18px]
px-1
text-xs
font-medium
text-white
bg-red-500
rounded-full
```

### **Modals**
```css
/* Modal Overlay */
fixed
inset-0
bg-black
bg-opacity-50
z-[45]

/* Modal Container */
bg-white
rounded-2xl
shadow-xl
border
border-gray-200
max-w-md  /* or max-w-lg, max-w-xl, etc. */
mx-auto
p-6

/* Modal Header */
flex
items-center
justify-between
pb-4
border-b
border-gray-200

/* Modal Close Button */
p-2
hover:bg-gray-100
rounded-lg
transition-colors
```

### **Forms**
```css
/* Form Container */
space-y-6

/* Form Labels */
block
text-sm
font-semibold
text-gray-700
mb-2.5

/* Form Fields */
space-y-6

/* Error Messages */
mt-1
text-sm
text-red-600

/* Success Messages */
p-4
bg-gradient-to-r
from-green-50
to-emerald-50
border-2
border-green-200
rounded-xl
text-green-700
text-sm
shadow-sm
```

---

## 🎭 **Shadows**

```css
shadow-sm:    0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow:       0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)
shadow-md:    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
shadow-lg:    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
shadow-xl:    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)
shadow-2xl:    0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

---

## ✨ **Animations & Transitions**

### **Transition Durations**
```css
transition-all
duration-200:  200ms  /* Fast transitions */
duration-300:  300ms  /* Standard transitions */
duration-500:  500ms  /* Slower transitions */
duration-1000: 1000ms /* Very slow transitions */
```

### **Framer Motion Animations**
```css
/* Common Animation Patterns */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

/* Stagger Children */
variants={{
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 1.1
    }
  }
}}

/* Hover Effects */
whileHover={{ scale: 1.05, y: -4 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

### **CSS Animations (globals.css)**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse Animation */
animate-pulse

/* Spin Animation */
animate-spin
```

---

## 🌐 **RTL (Right-to-Left) Support**

### **RTL Utilities (globals.css)**
```css
[dir="rtl"] {
  direction: rtl;
  text-align: start;
}

[dir="ltr"] {
  direction: ltr;
  text-align: start;
}

/* RTL-aware margin utilities */
.ms-auto: margin-inline-start: auto;
.me-auto: margin-inline-end: auto;

/* RTL-aware padding utilities */
.ps-0 to .ps-12: padding-inline-start
.pe-0 to .pe-12: padding-inline-end

/* RTL-aware text alignment */
.text-start: text-align: start;
.text-end: text-align: end;

/* RTL-aware transforms */
[dir="rtl"] .rtl-mirror {
  transform: scaleX(-1);
}

/* RTL-aware flex direction */
[dir="rtl"] .rtl-flex-row-reverse {
  flex-direction: row-reverse;
}
```

---

## 🎨 **Gradients**

### **Background Gradients**
```css
/* Primary Gradient */
bg-gradient-to-br
from-primary-50
via-white
to-primary-50/30

/* Blue Gradient */
bg-gradient-to-br
from-primary-600
via-primary-700
to-primary-800

/* Text Gradient */
bg-gradient-to-r
from-primary-200
via-white
to-primary-300
bg-clip-text
text-transparent

/* Button Gradient */
bg-gradient-to-r
from-transparent
via-white/20
to-transparent

/* Custom Gradient Classes */
.vettly-gradient-blue {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}

.vettly-gradient-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}
```

---

## 🔤 **Icons**

### **Icon Library: Lucide React**
All icons are imported from `lucide-react`. Common icons used:

#### **Navigation & UI**
- `Menu`, `X`, `ChevronDown`, `ChevronRight`, `ChevronLeft`, `ChevronUp`
- `ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`
- `Search`, `Filter`, `Settings`, `Bell`, `User`, `LogOut`

#### **Content & Actions**
- `FileText`, `Upload`, `Download`, `Edit`, `Trash2`, `Save`
- `Check`, `CheckCircle`, `CheckCircle2`, `XCircle`, `AlertCircle`
- `Plus`, `Minus`, `MoreVertical`, `MoreHorizontal`

#### **Business & Jobs**
- `Briefcase`, `Building2`, `Users`, `Mail`, `Phone`, `Globe`
- `MapPin`, `Calendar`, `Clock`, `DollarSign`

#### **Status & Feedback**
- `Loader2`, `AlertTriangle`, `Info`, `CheckCircle`, `XCircle`
- `Eye`, `EyeOff`, `Lock`, `Unlock`

#### **Media & Communication**
- `Video`, `Mic`, `MicOff`, `Speaker`, `Volume2`
- `MessageSquare`, `Send`

#### **Features**
- `Target`, `TrendingUp`, `Zap`, `Shield`, `Brain`
- `Languages`, `BarChart3`, `Activity`, `History`
- `CreditCard`, `Database`, `Link`, `LinkIcon`

#### **Social & External**
- `Linkedin`, `Twitter`, `Facebook`, `Instagram`

### **Icon Sizes**
```css
w-4 h-4:  1rem   /* 16px - Small icons */
w-5 h-5:  1.25rem /* 20px - Default icons */
w-6 h-6:  1.5rem  /* 24px - Medium icons */
w-8 h-8:  2rem    /* 32px - Large icons */
w-12 h-12: 3rem   /* 48px - Extra large icons */
```

### **Custom Icon Components**
- `@/components/icon/linked-in-icon.tsx`
- `@/components/icon/indeed-icon.tsx`
- `@/components/icon/naukari-icon.tsx`

---

## 📱 **Responsive Breakpoints**

```css
sm:  640px   /* Small devices (phones) */
md:  768px   /* Medium devices (tablets) */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X Extra large devices */
```

### **Common Responsive Patterns**
```css
/* Hide on mobile, show on desktop */
hidden lg:flex

/* Show on mobile, hide on desktop */
lg:hidden

/* Responsive padding */
px-4 lg:px-16

/* Responsive text size */
text-2xl lg:text-4xl

/* Responsive container */
max-w-md lg:max-w-4xl
```

---

## 🎯 **Z-Index Scale**

```css
z-0:    0
z-10:   10
z-20:   20
z-30:   30
z-40:   40   /* Header */
z-45:   45   /* Modal overlay */
z-50:   50   /* Sidebar, dropdowns, modals */
z-[55]: 55   /* Mobile sidebar */
z-[60]: 60   /* Mobile menu button */
```

---

## 🎨 **Custom CSS Classes (globals.css)**

### **Vettly Button Classes**
```css
.vettly-btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl;
}

.vettly-btn-secondary {
  @apply bg-white hover:bg-gray-50 text-primary-500 border-2 border-primary-500 font-semibold px-6 py-3 rounded-lg transition-all duration-200;
}
```

### **Vettly Section Classes**
```css
.vettly-section {
  @apply py-16 lg:py-24;
}

.vettly-container {
  @apply container mx-auto px-4;
}
```

### **Vettly Card Classes**
```css
.vettly-card {
  @apply bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300;
}
```

### **Vettly Hover Effects**
```css
.vettly-hover-lift {
  @apply transition-all duration-300 hover:scale-105 hover:shadow-xl;
}

.vettly-btn-animated {
  @apply transition-all duration-300 hover:scale-105 hover:shadow-xl;
}
```

### **Vettly Curved Sections**
```css
.vettly-curved-bottom::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(
    to right,
    transparent 0%,
    transparent 20%,
    #0ea5e9 20%,
    #0ea5e9 80%,
    transparent 80%,
    transparent 100%
  );
  border-radius: 50% 50% 0 0;
}
```

---

## 📋 **Summary of Key Values**

### **Most Common Values**

#### **Border Radius**
- Buttons: `rounded-lg` (8px) or `rounded-xl` (12px)
- Inputs: `rounded-lg` (8px) or `rounded-xl` (12px)
- Cards: `rounded-xl` (12px) or `rounded-2xl` (16px)
- Badges: `rounded-full` (circular)

#### **Padding**
- Buttons: `px-6 py-3` (24px × 12px)
- Inputs: `px-4 py-2` (16px × 8px) or `px-4 py-3` (16px × 12px)
- Cards: `p-4` (16px) to `p-6` (24px)
- Containers: `px-4` (mobile) to `px-16` (desktop)

#### **Heights**
- Buttons: `h-11` (44px) or `h-12` (48px)
- Inputs: `h-11` (44px) or `h-14` (56px)
- Header: `py-[18px]` (18px vertical padding)

#### **Text Sizes**
- Body: `text-sm` (14px) or `text-base` (16px)
- Headings: `text-2xl` (24px) to `text-4xl` (36px)
- Labels: `text-sm` (14px)

#### **Colors**
- Primary: `primary-500` (#0ea5e9)
- Text: `gray-900` (#111827) for main, `gray-600` (#4b5563) for secondary
- Background: `white` or `gray-50` for light backgrounds
- Borders: `gray-200` (#e5e7eb) or `gray-300` (#d1d5db)

---

## 🔗 **Additional Resources**

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **Framer Motion**: https://www.framer.com/motion
- **Radix UI**: https://www.radix-ui.com

---

*Last Updated: Based on current codebase analysis*
*Framework: Tailwind CSS v3.4.0*
*Icon Library: Lucide React v0.460.0*

