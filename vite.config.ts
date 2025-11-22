import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
	define: {
		// Auto-inject version from package.json
		"import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
	},
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
		}),
		react(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		include: [
			"jotai",
			"jotai-tanstack-query",
			"@tanstack/react-query",
			"@supabase/supabase-js",
			"@supabase/auth-ui-react",
			"@supabase/auth-ui-shared",
		],
	},
	server: {
		hmr: {
			overlay: true,
		},
	},
});
