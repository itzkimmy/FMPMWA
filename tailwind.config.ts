import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "studio-bg": "#0B0F17",
        "studio-surface": "#111827",
        "studio-panel": "#151F30",
        "studio-panel-hover": "#1E293B",
        "studio-border": "rgba(255, 255, 255, 0.08)",
        "studio-border-subtle": "rgba(255, 255, 255, 0.05)",
        "studio-border-glow": "rgba(245, 158, 11, 0.2)",
        "studio-amber": "#F59E0B",
        "studio-amber-dim": "#D97706",
        "studio-amber-subtle": "rgba(245, 158, 11, 0.12)",
        "studio-sage": "#10B981",
        "studio-sage-subtle": "rgba(16, 185, 129, 0.12)",
        "studio-clay": "#F43F5E",
        "studio-clay-subtle": "rgba(244, 63, 94, 0.12)",
        "studio-film": "#818CF8",
        "studio-film-subtle": "rgba(129, 140, 248, 0.12)",
        "studio-text": "#F8FAFC",
        "studio-text-muted": "#94A3B8",
        "studio-text-faint": "#64748B",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }],
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.3)",
        card: "0 2px 6px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)",
        "panel-lg": "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
        glow: "0 0 15px -3px rgba(245, 158, 11, 0.3)",
        "glow-lg": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "slide-up": "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(3px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;