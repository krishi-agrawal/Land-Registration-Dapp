import React, { useState, useEffect } from "react";
import { ThemeContext, themes } from "../../contexts/ThemeContext";

export default function ThemeContextWrapper(props) {
  const [theme, setTheme] = useState(themes.light);

  // Function to change the theme
  const changeTheme = (theme) => {
    setTheme(theme);
  };

  // Apply theme changes to the document body
  useEffect(() => {
    const body = document.body;
    if (theme === themes.dark) {
      body.classList.add("dark");
      body.classList.remove("light");
    } else {
      body.classList.add("light");
      body.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <div className={`${theme === themes.dark ? "dark" : "light"} min-h-screen`}>
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
          {props.children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}