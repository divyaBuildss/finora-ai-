/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "on-secondary": "#3c2f00",
        "secondary-fixed-dim": "#e9c349",
        "surface-glass": "rgba(255, 255, 255, 0.03)",
        "on-background": "#e0e3df",
        "tertiary": "#ffb3b1",
        "surface-container-low": "#181c1a",
        "outline": "#869489",
        "on-secondary-fixed": "#241a00",
        "on-primary": "#003921",
        "inverse-surface": "#e0e3df",
        "inverse-primary": "#006d43",
        "surface-bright": "#363a38",
        "surface-container-highest": "#323633",
        "secondary-container": "#af8d11",
        "secondary": "#e9c349",
        "primary-fixed": "#78fbb6",
        "secondary-fixed": "#ffe088",
        "tertiary-fixed-dim": "#ffb3b1",
        "on-tertiary-container": "#5e0211",
        "primary-container": "#00a86b",
        "surface-container-lowest": "#0b0f0d",
        "on-tertiary": "#650815",
        "background": "#101412",
        "surface-dim": "#101412",
        "primary-fixed-dim": "#59de9b",
        "surface-tint": "#59de9b",
        "on-primary-container": "#00331d",
        "primary": "#59de9b",
        "on-error-container": "#ffdad6",
        "error": "#ffb4ab",
        "on-primary-fixed": "#002111",
        "border-subtle": "rgba(248, 247, 243, 0.1)",
        "on-error": "#690005",
        "surface-container": "#1c201e",
        "error-container": "#93000a",
        "on-secondary-container": "#342800",
        "on-surface": "#e0e3df",
        "on-tertiary-fixed-variant": "#852229",
        "ivory-white": "#F8F7F3",
        "outline-variant": "#3d4a41",
        "inverse-on-surface": "#2d312f",
        "tertiary-fixed": "#ffdad8",
        "surface-variant": "#323633",
        "surface-container-high": "#272b28",
        "tertiary-container": "#e86c6e",
        "on-surface-variant": "#bccabe",
        "on-secondary-fixed-variant": "#574500",
        "surface": "#101412",
        "on-tertiary-fixed": "#410008",
        "on-primary-fixed-variant": "#005232"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "container-max": "1280px",
        "unit": "8px",
        "margin-mobile": "20px",
        "gutter": "24px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "display-lg": ["Hanken Grotesk"],
        "headline-lg-mobile": ["Hanken Grotesk"],
        "headline-md": ["Hanken Grotesk"],
        "label-md": ["Geist"],
        "body-md": ["Inter"],
        "label-sm": ["Geist"],
        "body-lg": ["Inter"],
        "headline-lg": ["Hanken Grotesk"]
      },
      fontSize: {
        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "500"}],
        "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}]
      },
      animation: {
        'fade-in':   'fadeIn 0.45s ease-out both',
        'slide-up':  'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':     'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        }
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
