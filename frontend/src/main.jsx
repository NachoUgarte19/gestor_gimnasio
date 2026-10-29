import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import App from './App.jsx'

// index.html tiene un <div id="root"></div>. React dibuja App dentro de él.
createRoot(document.getElementById('root')).render(
  // StrictMode ayuda a detectar problemas mientras desarrollamos.
  <StrictMode>
    <App />
  </StrictMode>,
)
