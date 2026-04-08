import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
export const authService = "http://localhost:5000"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="860707617323-b0ok2etis57j6l6ebuu0aupinn4mdcmj.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    
  </StrictMode>,
)
