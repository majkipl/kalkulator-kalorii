import {useState, useEffect} from 'react';

/**
 * Customowy hook do zarządzania motywem aplikacji (light/dark/system).
 * @returns {[string, function]} Zwraca aktualny motyw i funkcję do jego zmiany.
 */
const useTheme = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            localStorage.setItem('theme', theme);
        };

        applyTheme();

        // Nasłuchuj zmian preferencji systemowych
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [theme]);

    return [theme, setTheme];
};

export default useTheme;