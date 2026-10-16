import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { adminStore } from './services/adminStore'
import { matchStore } from './services/matchStore'

// Hydrate authoritative stores from Supabase on application startup
adminStore.initSupabaseSync().catch(err => console.warn('[App] AdminStore hydration notice:', err));
matchStore.initSupabaseSync().catch(err => console.warn('[App] MatchStore hydration notice:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
