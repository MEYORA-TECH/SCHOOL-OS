/** Modernist tokens, blue accent. Flat, zero radius, 2px rules. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#f4f4f5",
        ink: "#1f2430",
        muted: "#605d5d",
        line: "#d7d3d3",
        divider: "rgba(32,30,29,0.4)",
        accent: {
          DEFAULT: "#1d4ed8",
          100: "#eef3ff",
          200: "#dce6ff",
          300: "#b9cdfd",
          600: "#1a44bd",
          700: "#17389b",
          900: "#0f2360"
        },
        ok: { DEFAULT: "#15803d", bg: "#e7f6ec" },
        warn: { DEFAULT: "#b45309", bg: "#fdf3e2" },
        bad: { DEFAULT: "#b91c1c", bg: "#fdecec" }
      },
      fontFamily: { sans: ["Archivo", "system-ui", "sans-serif"] },
      borderRadius: { none: "0px" },
      boxShadow: { lg: "0 12px 32px rgba(45,43,43,0.22)" }
    }
  },
  plugins: []
};
