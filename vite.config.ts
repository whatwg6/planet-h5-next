import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
            {
              name: "removeAttrs",
              params: {
                attrs: ["fill", "fill-opacity", "stroke", "stroke-width"],
              },
            },
            {
              name: "addAttributesToSVGElement",
              params: {
                attributes: [{ fill: "currentColor" }],
              },
            },
          ],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: true,
    setupFiles: "./src/test/setup.ts",
  },
});
