import { useEffect, useRef, useState } from 'react'
import Mensaje from '../../components/Mensaje.jsx'
import Privacidad from '../privacidad/Privacidad.jsx'
import { siguienteId } from '../../utils/listas.js'
import { validarSocio } from '../../utils/validaciones.js'
import { validarCancelacionCliente, validarReservaCliente } from './clienteUtils.js'
import ClasesCliente from './clases/ClasesCliente.jsx'
import ConfirmarReserva from './reservas/ConfirmarReserva.jsx'
import MisReservas from './reservas/MisReservas.jsx'
import PerfilCliente from './perfil/PerfilCliente.jsx'
import './Cliente.css'

const secciones = ['Clases', 'Mis reservas', 'Perfil']

// Coordina las pantallas del socio y solicita a App las actualizaciones de datos compartidos.
function Cliente({ datos, actualizarLista, errorGuardado, onIrAdministrador }) {
  const [socioId, setSocioId] = useState(datos.socios[0]?.id ?? '')
  const [pantalla, setPantalla] = useState('Clases')
  const [seleccion, setSeleccion] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const contenido = useRef(null)
  const socio = datos.socios.find((item) => item.id === socioId) || datos.socios[0]

  // El titulo acompania la seccion actual; [pantalla] evita repetir el efecto por otros cambios.
  useEffect(() => {
    document.title = pantalla + ' · Mi gimnasio | Gestor Gym'
  }, [pantalla])

  // Limpia avisos y selecciones temporales al cambiar de pantalla; las listas del gimnasio se conservan.
  function navegar(seccion) {
    setPantalla(seccion)
    setSeleccion(null)
    setMensaje('')
    setError('')
    contenido.current.focus()
    contenido.current.scrollIntoView({ block: 'start' })
  }

  // El selector simula otra cuenta. Number convierte el valor de texto del select al id numerico.
  function cambiarSocio(id) {
    setSocioId(Number(id))
    navegar('Clases')
  }

  // Guarda claseId y fecha para revisar ese turno en la pantalla de confirmacion.
  function elegirClase(turno) {
    navegar('Confirmar reserva')
    setSeleccion(turno)
  }

  // Valida otra vez el turno antes de agregarlo. Despues abre Mis reservas y comunica el resultado.
  function confirmarReserva() {
    // El id del socio se toma de la cuenta actual, nunca de un campo editable.
    const reserva = { id: null, socioId: socio.id, claseId: seleccion.claseId, fecha: seleccion.fecha }
    const fallo = validarReservaCliente(reserva, socio, datos.clases, datos.reservas)
    if (fallo) return setError(fallo)
    actualizarLista('reservas', [...datos.reservas, { ...reserva, id: siguienteId(datos.reservas) }])
    navegar('Mis reservas')
    setMensaje('¡Tu lugar está confirmado! La reserva ya aparece en Mis reservas.')
  }

  // Comprueba la reserva y crea una lista sin ese registro. true indica que la tarjeta puede cerrar la confirmacion.
  function cancelarReserva(id) {
    const reserva = datos.reservas.find((item) => item.id === id)
    const fallo = validarCancelacionCliente(reserva, socio, datos.clases)
    if (fallo) { setMensaje(''); setError(fallo); return false }
    actualizarLista('reservas', datos.reservas.filter((item) => item.id !== id))
    setError('')
    setMensaje('Reserva cancelada. El lugar volvió a estar disponible.')
    return true
  }

  // Valida el perfil y reemplaza solo al socio actual mediante map, conservando las otras cuentas.
  function guardarPerfil(perfil) {
    const fallo = validarSocio(perfil, datos.socios, datos.planes)
    if (fallo) { setMensaje(''); setError(fallo); return false }
    actualizarLista('socios', datos.socios.map((item) => item.id === socio.id ? perfil : item))
    setError('')
    setMensaje('Tus datos se actualizaron correctamente.')
    return true
  }

  return (
    <div className="client-shell">
      <a className="skip-link" href="#contenido-cliente">Saltar al contenido</a>
      <header className="client-topbar">
        <div className="client-brand"><span className="brand-mark" aria-hidden="true">G</span>Gestor Gym</div>
        {socio && <span className="client-small-avatar" aria-label={'Cuenta de ' + socio.nombre + ' ' + socio.apellido}>{socio.nombre[0]}{socio.apellido[0]}</span>}
      </header>
      {/* CSS ubica este mismo menú a la izquierda en desktop y abajo en celular. */}
      <nav className="client-nav" aria-label="Secciones del cliente">
        <p className="client-nav-label">Mi gimnasio</p>
        {secciones.map((seccion) => {
          const activa = pantalla === seccion || (seccion === 'Clases' && pantalla === 'Confirmar reserva')
          return <button key={seccion} type="button" className={activa ? 'active' : ''} aria-current={activa ? 'page' : undefined} onClick={() => navegar(seccion)}><span className="client-nav-dot" aria-hidden="true" />{seccion}</button>
        })}
      </nav>
      <div className="client-content">
        <div className="client-demo">
          <label htmlFor="socio-demo">Socio de ejemplo</label>
          <select id="socio-demo" value={socio?.id ?? ''} disabled={!socio} onChange={(e) => cambiarSocio(e.target.value)}>
            {!socio && <option value="">No hay socios</option>}
            {datos.socios.map((item) => <option key={item.id} value={item.id}>{item.nombre} {item.apellido} · DNI {item.dni}{item.activo ? '' : ' · Inactivo'}</option>)}
          </select>
          <p>Demostración local. Elegí un socio para recorrer su cuenta.</p>
        </div>

        <main className="client-main" id="contenido-cliente" ref={contenido} tabIndex="-1">
          <Mensaje texto={errorGuardado} error />
          <Mensaje texto={mensaje} />
          <Mensaje texto={error} error />
          {pantalla === 'Privacidad' ? <Privacidad onVolver={() => navegar('Perfil')} textoVolver="Volver a mi perfil" /> : !socio ? (
            <section className="empty-state"><h1>No hay socios para mostrar</h1><p>Agregá un socio desde el administrador para probar esta vista.</p><button type="button" className="crud-primary" onClick={onIrAdministrador}>Ir al administrador</button></section>
          ) : (
            <div key={socio.id}>
              {/* Conservamos el día elegido y la búsqueda al volver de la confirmación. */}
              <div hidden={pantalla !== 'Clases'}><ClasesCliente socio={socio} planes={datos.planes} clases={datos.clases} reservas={datos.reservas} onReservar={elegirClase} onVerReservas={() => navegar('Mis reservas')} onVerPerfil={() => navegar('Perfil')} /></div>
              {pantalla === 'Confirmar reserva' && seleccion && <ConfirmarReserva seleccion={seleccion} socio={socio} clases={datos.clases} planes={datos.planes} reservas={datos.reservas} onConfirmar={confirmarReserva} onVolver={() => navegar('Clases')} />}
              {pantalla === 'Mis reservas' && <MisReservas socio={socio} clases={datos.clases} reservas={datos.reservas} onCancelar={cancelarReserva} onVerClases={() => navegar('Clases')} onMensaje={(texto) => { setError(''); setMensaje(texto) }} />}
              {pantalla === 'Perfil' && <PerfilCliente socio={socio} planes={datos.planes} pagos={datos.pagos} onGuardar={guardarPerfil} onMensaje={(texto) => { setError(''); setMensaje(texto) }} onPrivacidad={() => navegar('Privacidad')} />}
            </div>
          )}
        </main>
        <footer className="client-footer"><span>Gestor Gym · Vista del socio</span><button type="button" className="privacy-link" onClick={() => navegar('Privacidad')}>Políticas de privacidad</button></footer>
      </div>

      <div className="client-account">
        {socio && <span className="client-small-avatar" aria-hidden="true">{socio.nombre[0]}{socio.apellido[0]}</span>}
        <div><strong>{socio ? socio.nombre + ' ' + socio.apellido : 'Mi cuenta'}</strong><span>Vista del socio</span></div>
      </div>
    </div>
  )
}

export default Cliente
