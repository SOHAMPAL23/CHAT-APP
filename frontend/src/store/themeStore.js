import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            mode: 'dark', // 'dark' or 'light'
            themeName: 'discord', // 'discord', 'ocean', 'sunset', 'forest', 'midnight'

            // Toggle between dark and light mode
            toggleMode: () =>
                set((state) => ({
                    mode: state.mode === 'dark' ? 'light' : 'dark',
                })),

            // Set specific mode
            setMode: (mode) => set({ mode }),

            // Set theme name
            setThemeName: (themeName) => set({ themeName }),

            // Set both mode and theme
            setTheme: (mode, themeName) => set({ mode, themeName }),
        }),
        {
            name: 'theme-storage', // localStorage key
        }
    )
);
