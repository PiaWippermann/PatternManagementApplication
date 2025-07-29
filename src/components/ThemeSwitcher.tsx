import { useTheme } from "../context/ThemeContext";

export const ThemeSwitcher = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-sm rounded border border-gray-400 dark:border-gray-600"
      type="reset"
    >
      Theme: {theme === "system" ? `system (${resolvedTheme})` : theme}
    </button>
  );
};
