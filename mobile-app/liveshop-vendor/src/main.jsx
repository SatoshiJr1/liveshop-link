import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Workbox } from 'workbox-window'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  const workbox = new Workbox('/sw.js', { scope: '/' })
  workbox.addEventListener('activated', (event) => {
    // Activer navigation preload pour accélérer les navigations
    if ('navigationPreload' in self.registration) {
      self.registration.navigationPreload.enable().catch(() => {})
    }
  })
  workbox.register()
}
