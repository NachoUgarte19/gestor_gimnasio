import { useEffect, useRef, useState } from 'react'
import Agenda from '../agenda/Agenda.jsx'
import Socios from '../socios/Socios.jsx'
import Clases from '../clases/Clases.jsx'
import Planes from '../planes/Planes.jsx'
import Reservas from '../reservas/Reservas.jsx'
import Pagos from '../pagos/Pagos.jsx'
import Privacidad from '../privacidad/Privacidad.jsx'
import Mensaje from '../../components/Mensaje.jsx'

const secciones = ['Agenda', 'Socios', 'Clases', 'Planes', 'Reservas', 'Pagos']

// Recibe los datos de App. Sus estados propios controlan la pantalla y los mensajes del panel.
function Administrador({ datos, actualizarLista, restaurarDatos, errorGuardado }) {
  const [pantalla, setPantalla] = useState('Agenda')
  const [version, setVersion] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const contenido = useRef(null)

  // Este efecto cambia el titulo de la pestania cuando cambia pantalla.
  useEffect(() => {
    document.title = pantalla + ' | Gestor Gym'
  }, [pantalla])

  // Cambia la seccion visible y lleva el foco al contenido para facilitar el uso del teclado.
  function navegar(seccion) {
    setPantalla(seccion)
    // Al navegar con teclado, el foco pasa al contenido elegido.
    contenido.current.focus()
    contenido.current.scrollIntoView({ block: 'start' })
  }

  // Pide confirmacion, reemplaza los datos por ejemplos y cambia la key para reiniciar los formularios.
  function restaurar() {
    if (!window.confirm('¿Restaurar los datos de ejemplo? Se reemplazarán los cambios guardados en este navegador.')) return
    restaurarDatos()
    setVersion(version + 1) // Reinicia también los formularios y filtros.
    setMensaje('Se restauraron los datos de ejemplo para la semana actual.')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">G</span>Gestor Gym</div>
        <p className="nav-label">Gestión</p>
        <nav aria-label="Secciones de administración">
          {secciones.map((seccion) => (
            <button key={seccion} type="button" className={'nav-item' + (pantalla === seccion ? ' active' : '')}
              aria-current={pantalla === seccion ? 'page' : undefined} onClick={() => navegar(seccion)}>{seccion}</button>
          ))}
        </nav>
        <div className="sidebar-bottom"><strong>Administrador</strong><span>Panel del gimnasio</span></div>
      </aside>

      <main className="main-content" id="contenido" ref={contenido} tabIndex="-1">
        <div className="demo-banner">
          <p><strong>Demostración con datos locales</strong><span>Los cambios se guardan en este navegador.</span></p>
          <button type="button" className="crud-secondary" onClick={restaurar}>Restaurar ejemplos</button>
        </div>
        <Mensaje texto={errorGuardado} error />
        <Mensaje texto={mensaje} />
        {/* Una única fuente de datos permite reflejar los cambios entre módulos.
            hidden conserva los filtros y formularios al cambiar de sección. */}
        <div key={version}>
          <div hidden={pantalla !== 'Agenda'}><Agenda clases={datos.clases} reservas={datos.reservas} /></div>
          <div hidden={pantalla !== 'Socios'}><Socios lista={datos.socios} planes={datos.planes} reservas={datos.reservas} pagos={datos.pagos} setLista={(lista) => actualizarLista('socios', lista)} /></div>
          <div hidden={pantalla !== 'Clases'}><Clases lista={datos.clases} reservas={datos.reservas} setLista={(lista) => actualizarLista('clases', lista)} /></div>
          <div hidden={pantalla !== 'Planes'}><Planes lista={datos.planes} socios={datos.socios} setLista={(lista) => actualizarLista('planes', lista)} /></div>
          <div hidden={pantalla !== 'Reservas'}><Reservas lista={datos.reservas} socios={datos.socios} clases={datos.clases} setLista={(lista) => actualizarLista('reservas', lista)} /></div>
          <div hidden={pantalla !== 'Pagos'}><Pagos lista={datos.pagos} socios={datos.socios} setLista={(lista) => actualizarLista('pagos', lista)} /></div>
          <div hidden={pantalla !== 'Privacidad'}><Privacidad onVolver={() => navegar('Agenda')} /></div>
        </div>
        <footer className="app-footer">
          <span>Gestor Gym · Demostración académica</span>
          <button type="button" className="privacy-link" aria-current={pantalla === 'Privacidad' ? 'page' : undefined} onClick={() => navegar('Privacidad')}>Políticas de privacidad</button>
        </footer>
      </main>
    </div>
  )
}

export default Administrador
