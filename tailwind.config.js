/**
 * SchoolOS design tokens — modern, calm enterprise SaaS.
 * Cool slate neutrals + a single indigo-blue brand, soft radii, whisper shadows.
 * Semantic colours (ok / warn / bad / info) each carry a foreground + a soft surface.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: "#f5f7fa",        // app background
        surface: "#ffffff",       // cards / panels
        subtle: "#f1f4f9",        // inset fields, zebra, hovers
        // Text
        ink: "#0f172a",           // primary text / headings
        body: "#334155",          // default body copy
        muted: "#64748b",         // secondary / captions
        faint: "#94a3b8",         // placeholder / disabled
        // Lines
        line: "#e6eaf1",          // default hairline
        "line-strong": "#d3dae5", // emphasised divider
        // Brand
        accent: {
          DEFAULT: "#2563eb",
          50: "#eff5ff",
          100: "#dbe8ff",
          200: "#bcd3ff",
          300: "#8fb4ff",
          400: "#5f8bf7",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1a3fb0",
          800: "#1a368c",
          900: "#182f6f"
        },
        // Semantics — { DEFAULT: text/icon, bg: soft surface, border, strong: fill }
        ok:   { DEFAULT: "#15803d", bg: "#e9f7ee", border: "#bbe6c9", strong: "#16a34a" },
        warn: { DEFAULT: "#b45309", bg: "#fdf3e3", border: "#f6dcaf", strong: "#d97706" },
        bad:  { DEFAULT: "#be123c", bg: "#fdecef", border: "#f6c9d3", strong: "#e11d48" },
        info: { DEFAULT: "#1d4ed8", bg: "#eef4ff", border: "#c9dbff", strong: "#2563eb" }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Archivo", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        // Semantic type scale (line-heights baked in)
        caption: ["12px", { lineHeight: "16px" }],
        label:   ["13px", { lineHeight: "18px", letterSpacing: "0.005em" }],
        body:    ["14px", { lineHeight: "21px" }],
        "body-lg": ["15px", { lineHeight: "23px" }],
        h3:      ["16px", { lineHeight: "22px", letterSpacing: "-0.01em" }],
        h2:      ["19px", { lineHeight: "26px", letterSpacing: "-0.015em" }],
        h1:      ["24px", { lineHeight: "31px", letterSpacing: "-0.02em" }],
        display: ["30px", { lineHeight: "36px", letterSpacing: "-0.025em" }]
      },
      borderRadius: {
        none: "0px",
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px"
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15,23,42,0.05)",
        sm: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
        md: "0 4px 16px rgba(15,23,42,0.08)",
        lg: "0 12px 32px rgba(15,23,42,0.14)",
        pop: "0 16px 48px rgba(15,23,42,0.20)",
        focus: "0 0 0 3px rgba(37,99,235,0.28)"
      },
      spacing: {
        // 8px-grid extras used by controls
        4.5: "18px",
        13: "52px"
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        wave: {
          "0%,60%,100%": { transform: "rotate(0deg)" },
          "10%,30%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10deg)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "slide-up": "slide-up 0.28s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.18s cubic-bezier(0.16,1,0.3,1) both",
        "toast-in": "toast-in 0.26s cubic-bezier(0.16,1,0.3,1) both"
      }
    }
  },
  plugins: []
};
