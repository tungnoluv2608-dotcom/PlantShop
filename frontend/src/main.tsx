import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import tabLogo from './assets/tab_logo.jpg'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

document.title = 'PlanS Thanh Tùng'
const favicon = document.querySelector("link[rel='icon']") || document.createElement('link')
favicon.setAttribute('rel', 'icon')
favicon.setAttribute('href', tabLogo)
if (!favicon.parentElement) {
  document.head.appendChild(favicon)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)


