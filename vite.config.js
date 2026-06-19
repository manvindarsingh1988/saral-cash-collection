import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
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
            src: "/icons/icon_64_v2.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/icons/icon_128_v2.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/icons/icon_192_v2.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon_256_v2.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/icons/icon_512_v2.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
