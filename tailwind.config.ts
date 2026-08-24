import type { Config } from "tailwindcss";

/**
 * StudioLedger Tailwind configuration.
 * Design tokens per SKILLS.md §Visual System.
 * Never hardcode hex values in components — use these tokens.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background layers
        "studio-bg": "#14120F",
        "studio-panel": "#1C1914",
        "studio-panel-hover": "#221F18",
        "studio-border": "#332D23",
        "studio-border-subtle": "#252018",
        // Text
        "studio-text": "#E8E0D0",
        "studio-text-muted": "#8C7E68",
        "studio-text-faint": "#5A5040",
        // Accent colors
        "studio-amber": "#E8A33D",
        "studio-amber-dim": "#B87D2A",
        "studio-amber-subtle": "#2A2214",
        "studio-sage": "#6FA88A",
        "studio-sage-dim": "#4D7A62",
        "studio-sage-subtle": "#121E18",
        "studio-clay": "#C15B4A",
        "studio-clay-dim": "#8F3D2D",
        "studio-clay-subtle": "#1E130F",
        // Status-specific (maps to semantic colors)
        "status-inquiry": "#8C7E68", // muted grey
        "status-confirmed": "#6FA88A", // sage
        "status-completed": "#4D7A62", // sage-dim
        "status-cancelled": "#5A5040", // faint
        "status-editing": "#E8A33D", // amber
        "status-ready": "#B87D2A", // amber-dim
        "status-delivered": "#6FA88A", // sage
      },
      fontFamily: {
        // Per SKILLS.md: Archivo Expanded (headers), Inter (body), JetBrains Mono (numbers)
        sans: ["Inter", "system-ui", "sans-serif"],
        header: ["Archivo Expanded", "Archivo", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        pill: "9999px",
      },
      boxShadow: {
        panel: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)",
        "panel-lg": "0 4px 12px rgba(0,0,0,0.5)",
        glow: "0 0 12px rgba(232,163,61,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
