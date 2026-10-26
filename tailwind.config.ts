import type { Config } from "tailwindcss";

// Warna memakai variabel CSS (lihat globals.css) agar mode terang/gelap satu set kelas.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        bg: token("bg"),
        card: token("card"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        soft: token("soft"),
        primary: token("primary"),
        "primary-soft": token("primary-soft"),
        success: token("success"),
        "success-soft": token("success-soft"),
        danger: token("danger"),
        "danger-soft": token("danger-soft"),
        warning: token("warning"),
        "warning-soft": token("warning-soft"),
      },
      boxShadow: { card: "0 1px 2px rgb(30 27 75 / 0.04), 0 4px 16px rgb(30 27 75 / 0.05)" },
    },
  },
  plugins: [],
};

export default config;
