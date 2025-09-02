import { defineConfig } from "astro/config";
import node from '@astrojs/node';
import tailwindcss from "@tailwindcss/vite";
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
  // server: {
  //   port: 3000,
  //   host: "0.0.0.0"
  // },
  output: 'server',
  adapter: netlify(),
  // adapter: node({
  //   mode: 'standalone',
  // }),
  vite: {
    plugins: [tailwindcss()]
  }
});