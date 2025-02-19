import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import { patchCssModules } from 'vite-css-modules';

export default defineConfig({
    base: "./",
    plugins: [react(), patchCssModules(), svgr()],
    server: {
        port: 3000,
        host: 'localhost',
    },
    build: {
        sourcemap: true,
        minify: false,
    }
});
