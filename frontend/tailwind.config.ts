import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#141414",
        border: "#1e1e1e",
        "border-hover": "#242424",
        "text-primary": "#f5f5f5",
        "text-secondary": "#888888",
        accent: "#c0c0c0",
      },
      fontSize: {
        label: ["11px", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      borderRadius: {
        card: "8px",
      },
      maxWidth: {
        form: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
