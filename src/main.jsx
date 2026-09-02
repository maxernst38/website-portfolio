import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Fonts register before app CSS so the @theme stacks below resolve to real
// families rather than falling through to the system stack on first paint.
import '@fontsource-variable/inter'           // body copy
import '@fontsource-variable/space-grotesk'   // headings
import '@fontsource-variable/jetbrains-mono'  // metadata: dates, tags, eyebrows
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
