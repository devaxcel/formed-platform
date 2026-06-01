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
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        ink:    "#0C0C0B",
        cream:  "#F5F2EC",
        stone:  "#E8E4DC",
        warm:   "#C8C2B4",
        muted:  "#8C8880",
        accent: "#1A1A18",
        success: "#166534",
        warning: "#92400E",
        danger:  "#991B1B",
      },
    },
  },
  plugins: [],
};

export default config;