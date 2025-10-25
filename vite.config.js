import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate", // updates service worker automatically
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        name: "MSF Diabetes Calculator",
        short_name: "MSF Diabetes",
        id: "msf-diabetes-calculator-v0.2",
        description:
          "The MSF Diabetes Calculator allows clinicians to calculate variables for managing paediatric diabetic ketoacidosis based on the 2024 MSF paediatric guidelines.",
        start_url: "/",
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        handle_links: "preferred",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ec0000",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/(dev-api|api)\.msf\.dka-calculator\.co\.uk\/config$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "config-cache",
              expiration: {
                maxEntries: 1, // only keep the latest config
                maxAgeSeconds: 30 * 24 * 60 * 60, // cache for 30 days
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
