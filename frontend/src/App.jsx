import { useEffect, useState } from 'react'
import Administrador from './modules/administrador/Administrador.jsx'
import Cliente from './modules/cliente/Cliente.jsx'
import useDatosLocales from './hooks/useDatosLocales.js'
import './App.css'

// El fragmento de la dirección permite abrir directamente /#cliente.
// Es un selector para la entrega, no un sistema de autenticación.
// Lee el fragmento de la URL para decidir la vista inicial. Es navegacion de la demo.
function leerVista() {
  return ['#cliente', '#contenido-cliente'].includes(window.location.hash) ? 'cliente' : 'administrador'
}

// Componente principal: conserva los datos compartidos y entrega las listas a cada vista.
function App() {
  const [vista, setVista] = useState(leerVista)
  const { datos, actualizarLista, restaurarDatos, errorGuardado } = useDatosLocales()

  // Sincroniza el estado con cambios en #cliente o #administrador. El return retira el listener.
  useEffect(() => {
    function actualizarVista() {
      setVista(leerVista())
    }
    window.addEventListener('hashchange', actualizarVista)
    return () => window.removeEventListener('hashchange', actualizarVista)
  }, [])

  return (
    <>
      <header className="view-switch">
        <p><strong>Gestor Gym</strong><span>Demostración con datos locales compartidos</span></p>
        <nav aria-label="Elegir vista de demostración">
          <a href="#administrador" aria-current={vista === 'administrador' ? 'page' : undefined}>Administrador</a>
          <a href="#cliente" aria-current={vista === 'cliente' ? 'page' : undefined}>Cliente</a>
        </nav>
      </header>
      {vista === 'cliente' ? (
        <Cliente datos={datos} actualizarLista={actualizarLista} errorGuardado={errorGuardado}
          onIrAdministrador={() => { window.location.hash = 'administrador' }} />
      ) : (
        <Administrador datos={datos} actualizarLista={actualizarLista}
          restaurarDatos={restaurarDatos} errorGuardado={errorGuardado} />
      )}
    </>
  )
}

export default App
