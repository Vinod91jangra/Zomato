import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/Appcontext.tsx'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import { SocketProvider } from './context/SocketContext.tsx'

export const authService = "http://localhost:5000"
export const restaurantService = "http://localhost:5001"
export const utilsService = "http://localhost:5002"
export const realtimeService = "http://localhost:5004"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
     <GoogleOAuthProvider clientId="860707617323-b0ok2etis57j6l6ebuu0aupinn4mdcmj.apps.googleusercontent.com">
     <AppProvider>
      <SocketProvider>
         <App />
      </SocketProvider>
     
      <Toaster />
      </AppProvider> 
    </GoogleOAuthProvider>
   
    
  </StrictMode>,
)
