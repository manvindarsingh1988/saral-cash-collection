import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  base: "./", // replace with actual repo name
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["robots.txt"],
      manifest: {
        name: "Saral Cash Flow",
        short_name: "SaralCash",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#317EFB",
        icons: [
          {
            src: "/icons/icon_64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/icons/icon_128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/icons/icon_192.png", // 👈 Required
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon_256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/icons/icon_512.png", // 👈 Required
            sizes: "512x512",
            type: "image/png",
          },
        ],
        gcm_sender_id: "103953800507",
      },
    }),
  ],
});
