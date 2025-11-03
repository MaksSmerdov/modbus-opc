import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/global.scss'
import './shared/styles/_fonts.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
