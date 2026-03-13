import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version),
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    watch: {
      usePolling: false,
    },
    hmr: {
      port: 5173,
      overlay: true,
    },
  },
});
