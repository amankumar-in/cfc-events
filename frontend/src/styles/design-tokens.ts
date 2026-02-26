// src/styles/design-tokens.ts
// Design tokens for the CFC Events website

/**
 * Color Palette
 * Primary colors used throughout the site
 */
export const colors = {
  // Core brand colors
  primary: {
    900: "#000000", // Black
    800: "#171717", // Almost black for dark mode text
    700: "#262626", // Dark gray
    600: "#404040", // Medium dark gray
    500: "#737373", // Dark secondary text
  },
  secondary: {
    500: "#6b7280", // Medium gray for secondary text
    400: "#9ca3af", // Light secondary text
    300: "#d1d5db", // Very light gray for borders
    200: "#e5e7eb", // Light gray backgrounds
    100: "#f3f4f6", // Very light gray backgrounds
    50: "#f9fafb", // Almost white
  },
  white: "#ffffff",
  // Accent colors - used sparingly
  accent: {
    yellow: {
      500: "#eab308", // Regular yellow
      400: "#fbbf24", // Light yellow
      300: "#fcd34d", // Lighter yellow
    },
    red: {
      500: "#ef4444", // Regular red (used very rarely)
      400: "#f87171", // Light red
    },
  },
  // Semantic colors
  success: "#22c55e", // Green for success states
  warning: "#eab308", // Yellow for warning states
  error: "#ef4444", // Red for error states
  info: "#3b82f6", // Blue for info states
};

/**
 * Typography
 * Font families, sizes, weights, etc.
 */
export const typography = {
  fontFamily: {
    sans: ["Inter", "sans-serif"],
    mono: ["ui-monospace", "monospace"],
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

/**
 * Spacing
 * Consistent spacing values for margin, padding, etc.
 */
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
};

/**
 * Breakpoints
 * Screen size breakpoints for responsive design
 */
export const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * Border radius
 * For consistent rounding of elements
 */
export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px", // Fully rounded (circles)
};

/**
 * Shadows
 * For consistent elevation and depth
 */
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
};

/**
 * Transitions
 * For consistent animation timing
 */
export const transitions = {
  duration: {
    DEFAULT: "150ms",
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
  timing: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

/**
 * Z-index
 * For consistent stacking order
 */
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: "auto",
};

// Export all tokens as a single object
export const tokens = {
  colors,
  typography,
  spacing,
  breakpoints,
  borderRadius,
  shadows,
  transitions,
  zIndex,
};

export default tokens;
