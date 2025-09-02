import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  experimental: {
    staticImportMetaEnv: true,
  },
  vite: {
    plugins: [tailwindcss()]
  }
});