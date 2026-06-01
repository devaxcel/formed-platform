import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        ink:    "#0C0C0B",
        cream:  "#F5F2EC",
        stone:  "#E8E4DC",
        warm:   "#C8C2B4",
        muted:  "#8C8880",
        accent: "#1A1A18",
      },
      letterSpacing: {
        "ultra": "0.3em",
        "wide2": "0.15em",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;