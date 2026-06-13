import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F7F8FA",
        ink: "#17202A",
        muted: "#6B7280",
        line: "#E5E7EB",
        brand: "#1D8F72",
        danger: "#C2410C",
      },
    },
  },
  plugins: [],
} satisfies Config;
