import * as React from 'react';
import { useState } from 'react';
import { Icon } from '~/components/_common/Icon';

function isDarkMode() {
  const localStorageTheme = localStorage.getItem('theme');
  const osPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorageTheme) {
    return localStorageTheme === 'dark';
  } else {
    return osPreferDark;
  }
}

function selectDarkMode(darkMode: boolean) {
  if (darkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light');
  }
}

export const DarkModeSwitcher: React.FC = function DarkModeSwitcher() {
  const [darkMode, setDarkMode] = useState(isDarkMode);
  function toggleDarkMode() {
    selectDarkMode(!darkMode);
    setDarkMode(!darkMode);
  }
  return (
    <label className="block cursor-pointer" >
      <input type="checkbox" name="" className="hidden" onClick={toggleDarkMode} />
      <div className={"w-12 h-7 flex items-center secondary rounded-full p2 transition-all " + (darkMode ? "flex-row-reverse" : "flex-row")}>
        <div className="w-6 h-6 sidebar rounded-full shadow flex items-center justify-center transition-all">
          <Icon icon={darkMode ? "moon" : "sun"} className="text-lg"/>
        </div>
      </div>
    </label>
  )
}