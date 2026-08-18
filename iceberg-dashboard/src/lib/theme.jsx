import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('iceberg_theme') || 'dark'
  )

  function applyTheme(t) {
    const root = document.documentElement
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else if (t === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }

  useEffect(() => {
    applyTheme(theme)

    // Listen for system preference changes when in 'system' mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function setTheme(t) {
    localStorage.setItem('iceberg_theme', t)
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
