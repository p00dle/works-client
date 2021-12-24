import * as React from 'react';
import { useState } from 'react';
import { Icon } from '~/components/_common/Icon';

function isDarkMode() {
  const localStorageTheme = localStorage.getItem('theme');
  const osPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorageTheme) {
    console.log('Dark mode selected with local storage theme ', localStorageTheme);
    return localStorageTheme === 'dark';
  } else {
    console.log('Using OS preference', osPreferDark)
    return osPreferDark;
  }
}

function selectDarkMode(darkMode: boolean) {
  console.log('selectDarkMode', {darkMode})
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
  console.log('component', {darkMode});
  function toggleDarkMode() {
    console.log('why is this called twice');
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