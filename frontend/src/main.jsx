import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './theme/theme'
import { useThemeStore } from './store/themeStore'
import './index.css'
import App from './App.jsx'

function ThemedApp() {
  const { mode, themeName } = useThemeStore()
  const theme = createAppTheme(mode, themeName)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
)
