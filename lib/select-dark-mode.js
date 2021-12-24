function isDarkMode() {
  const localStorageTheme = localStorage.getItem('theme');
  const osPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorageTheme) {
    return localStorageTheme === 'dark';
  } else {
    return osPreferDark;
  }
}

function selectDarkMode(darkMode) {
  if (darkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light');
  }
}

selectDarkMode(isDarkMode());