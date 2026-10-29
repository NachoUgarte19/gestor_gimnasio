import { useState } from 'react'
// Cada pantalla está en su propia carpeta dentro de modules.
import Agenda from './modules/agenda/Agenda.jsx'
import Socios from './modules/socios/Socios.jsx'
import Clases from './modules/clases/Clases.jsx'
import Planes from './modules/planes/Planes.jsx'
import Pagos from './modules/pagos/Pagos.jsx'
import './App.css'

function App() {
  // Esta variable guarda la sección elegida en el menú.
  const [pantalla, setPantalla] = useState('agenda')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">G</span>Gestor Gym</div>
        <p className="nav-label">Gestión</p>
        {/* Cada botón cambia pantalla. active marca la sección seleccionada. */}
        <nav aria-label="Secciones">
          <button
            type="button"
            className={'nav-item' + (pantalla === 'agenda' ? ' active' : '')}
            aria-current={pantalla === 'agenda' ? 'page' : undefined}
            onClick={() => setPantalla('agenda')}
          >
            Agenda
          </button>
          <button
            type="button"
            className={'nav-item' + (pantalla === 'socios' ? ' active' : '')}
            aria-current={pantalla === 'socios' ? 'page' : undefined}
            onClick={() => setPantalla('socios')}
          >
            Socios
          </button>
          <button
            type="button"
            className={'nav-item' + (pantalla === 'clases' ? ' active' : '')}
            aria-current={pantalla === 'clases' ? 'page' : undefined}
            onClick={() => setPantalla('clases')}
          >
            Clases
          </button>
          <button
            type="button"
            className={'nav-item' + (pantalla === 'planes' ? ' active' : '')}
            aria-current={pantalla === 'planes' ? 'page' : undefined}
            onClick={() => setPantalla('planes')}
          >
            Planes
          </button>
          <button
            type="button"
            className={'nav-item' + (pantalla === 'pagos' ? ' active' : '')}
            aria-current={pantalla === 'pagos' ? 'page' : undefined}
            onClick={() => setPantalla('pagos')}
          >
            Pagos
          </button>
        </nav>
        <div className="sidebar-bottom"><strong>Recepción</strong><span>Panel del personal</span></div>
      </aside>

      <main className="main-content">
        {/* Las secciones ocultas siguen montadas para conservar sus cambios locales. */}
        <div hidden={pantalla !== 'agenda'}><Agenda /></div>
        <div hidden={pantalla !== 'socios'}><Socios /></div>
        <div hidden={pantalla !== 'clases'}><Clases /></div>
        <div hidden={pantalla !== 'planes'}><Planes /></div>
        <div hidden={pantalla !== 'pagos'}><Pagos /></div>
      </main>
    </div>
  )
}

export default App
