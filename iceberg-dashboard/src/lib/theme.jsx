import { createContext, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

const ThemeContext = createContext(null)

function resolveThemeName(t) {
  if (t === 'system') {
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return t === 'light' ? 'light' : 'dark'
}

export function applyThemeDOM(t) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolved = resolveThemeName(t)
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
  root.setAttribute('data-theme', resolved)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('iceberg_theme') || 'dark'
    applyThemeDOM(saved)
    return saved
  })

  useEffect(() => {
    applyThemeDOM(theme)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        applyThemeDOM('system')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function setTheme(t) {
    if (typeof document !== 'undefined') {
      applyThemeDOM(t)
    }
    localStorage.setItem('iceberg_theme', t)
    try {
      flushSync(() => {
        setThemeState(t)
      })
    } catch {
      setThemeState(t)
    }
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
