import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    // Types: 'light', 'dark', 'system'
    const theme = ref(localStorage.getItem('theme_preference') || 'system');

    const applyTheme = () => {
        const root = document.documentElement;
        let isDark = false;

        if (theme.value === 'dark') {
            isDark = true;
        } else if (theme.value === 'light') {
            isDark = false;
        } else {
            // System preference
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        localStorage.setItem('theme_preference', theme.value);
    };

    // Watch for system preference changes if 'system' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'system') {
            applyTheme();
        }
    });

    const setTheme = (newTheme) => {
        theme.value = newTheme;
        applyTheme();
    };

    return {
        theme,
        setTheme,
        applyTheme
    };
});
