// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加載當前模式的環境變量
  const env = loadEnv(mode, process.cwd(), "");

  const isDev = mode === "development";

  console.log(env.VITE_API_BASE_URL);

  return {
    plugins: [react()],
    server: isDev
      ? {
          port: 8080,
          proxy: {
            "/api": {
              target: "https://www.gurula.cc",
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          },
        }
      : {},
    build: {
      outDir: "build",
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: fileURLToPath(new URL("./src", import.meta.url)),
        },
        {
          find: "@assets",
          replacement: fileURLToPath(new URL("./src/assets", import.meta.url)),
        },
      ],
    },
    preview: {
      port: 8080,
    },
  };
});
