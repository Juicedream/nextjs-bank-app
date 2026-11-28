"use client";
import React, {useState, useEffect} from "react";


const ThemeWrapper = ({ children }) => {
  const [theme, setTheme] = useState("light"); 
  function handleChangeTheme(e) {
    const newTheme = e.target.value
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }
  useEffect(() => {    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
    }
  }, []);

  return (
    <div className="relative" data-theme={theme}>
      <div className="flex justify-end my-2 mx-2">
        <select
        onChange={handleChangeTheme}
        value={theme || "light"}
        className="select select-neutral w-fit rounded-md"
        >
          <option disabled={true}>Theme</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="cupcake">Cupcake</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="aqua">Aqua</option>
        </select>
      </div>
      {children}
    </div>
  );
};

export default ThemeWrapper;
