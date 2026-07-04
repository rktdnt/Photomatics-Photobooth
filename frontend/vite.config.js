import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    base: '/Photomatics-Photobooth/',
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/public/videos/**']
        }
    }
});
