import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      filename: "sw.js", // keep SW filename consistent
      registerType: "autoUpdate", // skipWaiting + clients.claim
      injectRegister: "auto", // auto-inject registration
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
        id: "msf-diabetes-calculator-v0.3",
        description:
          "The MSF Diabetes Calculator allows clinicians to calculate variables for managing paediatric diabetic ketoacidosis based on the 2024 MSF paediatric guidelines.",
        start_url: "/",
        scope: "/",
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        handle_links: "preferred",
        protocol_handlers: [
          {
            protocol: "web+msfdiabetes",
            url: "/?launch=%s",
          },
        ],
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#f5f5f5",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
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
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/(dev-api|api)\.msf\.dka-calculator\.co\.uk\/config$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "config-cache",
              expiration: { maxEntries: 1, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
        // 🔹 Force SW hash to change each build to trigger autoUpdate
        manifestTransforms: [
          (entries) => {
            const timestamp = Date.now().toString();
            return {
              manifest: [
                ...entries,
                { url: `/version-${timestamp}.txt`, revision: timestamp },
              ],
              warnings: [],
            };
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
