import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import config from "../shared/config/env.mjs";

// Use shared configuration for consistent environment handling
const { APP, AUTH_SYSTEM, EXTERNAL_SERVICES } = config;

// https://vite.dev/config/
export default defineConfig({
   plugins: [svelte()],

   // Load environment from root .env file
   envDir: resolve(__dirname, ".."),

   server: {
      port: APP.FRONTEND.PORT,
      host: APP.FRONTEND.HOST,

      // Proxy API calls to backend
      proxy: {
         "/api": {
            target: APP.BACKEND.URL,
            changeOrigin: true,
            secure: false,
            configure: (proxy, options) => {
               proxy.on("error", (err, req, res) => {
                  console.log("Proxy error:", err);
               });
               proxy.on("proxyReq", (proxyReq, req, res) => {
                  if (APP.IS_DEVELOPMENT) {
                     console.log(
                        "Proxying request:",
                        req.method,
                        req.url,
                        "->",
                        options.target + req.url
                     );
                  }
               });
            },
         },
      },
   },

   // Define environment variables for the frontend
   define: {
      // Make configuration available to frontend code
      "import.meta.env.VITE_BACKEND_URL": JSON.stringify(APP.BACKEND.URL),
      "import.meta.env.VITE_AUTH_SYSTEM_URL": JSON.stringify(
         AUTH_SYSTEM.SYSTEM_URL
      ),
      "import.meta.env.VITE_AUTH_API_URL": JSON.stringify(AUTH_SYSTEM.API_URL),
      "import.meta.env.VITE_DATA_SERVER_URL": JSON.stringify(
         EXTERNAL_SERVICES.DATA_SERVER.URL
      ),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(APP.FRONTEND.URL),

      // Development flags
      "import.meta.env.VITE_DEBUG_AUTH": JSON.stringify(config.DEBUG.AUTH),
      "import.meta.env.VITE_DEBUG_TRADING": JSON.stringify(
         config.DEBUG.TRADING
      ),
      "import.meta.env.VITE_DEBUG_WEBSOCKET": JSON.stringify(
         config.DEBUG.WEBSOCKET
      ),
   },

   build: {
      // Output build files
      outDir: "dist",

      // Generate source maps in development
      sourcemap: APP.IS_DEVELOPMENT,
   },

   // Resolve aliases for cleaner imports
   resolve: {
      alias: {
         "@": resolve(__dirname, "src"),
         "@shared": resolve(__dirname, "../shared"),
      },
   },
});
