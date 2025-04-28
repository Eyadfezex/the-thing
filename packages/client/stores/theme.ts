import { create } from "zustand";

/**
 * Represents the possible theme values that can be set
 * @type {"light" | "dark" | "system"}
 */
type Theme = "light" | "dark" | "system";

/**
 * Interface defining the theme state and its management functions
 * @interface
 */
interface ThemeState {
  /** Current theme preference */
  theme: Theme;
  /** Function to update the theme */
  setTheme: (theme: Theme) => void;
  /** The actual theme being applied (resolves "system" to either "light" or "dark") */
  resolvedTheme: "light" | "dark";
}

/**
 * Detects the system's current theme preference
 * @returns {"light" | "dark"} The current system theme
 */
function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

/** Local storage key for persisting theme preference */
const THEME_KEY = "theme-preference";

/**
 * Zustand store for managing theme state
 * Handles theme persistence, system theme detection, and theme changes
 */
export const useThemeStore = create<ThemeState>((set, get) => {
  // Initialize theme from localStorage or default to "system"
  let initialTheme: Theme = "system";
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      initialTheme = stored;
    }
  }

  // Helper to resolve actual theme
  const resolveTheme = (theme: Theme): "light" | "dark" => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  };

  // Listen to system theme changes if using "system"
  if (typeof window !== "undefined") {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (get().theme === "system") {
          set({ resolvedTheme: getSystemTheme() });
        }
      });
  }

  return {
    theme: initialTheme,
    setTheme: (theme: Theme) => {
      set({ theme, resolvedTheme: resolveTheme(theme) });
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_KEY, theme);
      }
    },
    resolvedTheme: resolveTheme(initialTheme),
  };
});
