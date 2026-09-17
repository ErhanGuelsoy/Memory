import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                index: 'index.html',
                settings: 'settings.html',
                gamingTheme: 'gaming-theme.html',
                foodTheme: 'food-theme.html'
            }
        }
    }
});