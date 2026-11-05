import { useState } from 'react'
import { claseComenzada, fechaLarga, reservasDelSocio } from '../clienteUtils.js'

// Separa las reservas propias en futuras e historicas. Sus estados solo controlan paneles y confirmaciones.
function MisReservas({ socio, clases, reservas, onCancelar, onVerClases, onMensaje }) {
  const [verHistorial, setVerHistorial] = useState(false)
  const [cancelacion, setCancelacion] = useState(null)
  // Primero se filtra por socioId; despues se separan los turnos segun si ya comenzaron.
  const propias = reservasDelSocio(reservas, clases, socio.id)
  const ahora = new Date()
  const proximas = propias.filter((reserva) => reserva.clase && !claseComenzada(reserva.clase, reserva.fecha, ahora))
  const anteriores = propias.filter((reserva) => !reserva.clase || claseComenzada(reserva.clase, reserva.fecha, ahora)).reverse()

  // onCancelar devuelve si pudo quitarse la reserva; solo entonces cerramos la confirmacion de esa tarjeta.
  function cancelar(reserva) {
    // El padre vuelve a comprobar que sea del socio y que el turno no haya empezado.
    if (onCancelar(reserva.id)) setCancelacion(null)
  }

  return (
    <>
      <header className="client-page-header">
        <p className="eyebrow">Mi actividad</p>
        <h1>Mis reservas</h1>
        <p>Tus próximas clases en un solo lugar.</p>
      </header>
      <section aria-label="Próximas reservas">
        <div className="client-section-row"><h2>Próximas</h2><span>{proximas.length} reservas</span></div>
        <div className="client-card-grid">
          {proximas.map((reserva) => (
            <article key={reserva.id} className="client-card">
              <div className="client-section-row"><span className="client-time">{reserva.clase.horario}</span><span className="client-pill">Confirmada</span></div>
              <h3>{reserva.clase.nombre}</h3>
              <p>{fechaLarga(reserva.fecha)}</p>
              <p>Con {reserva.clase.instructor}</p>
              {cancelacion === reserva.id ? (
                <div className="client-cancel" aria-label="Confirmar cancelación">
                  <p>¿Querés cancelar tu reserva? El lugar quedará disponible para otro socio.</p>
                  <div className="client-actions">
                    <button autoFocus type="button" className="crud-secondary" onClick={() => { setCancelacion(null); onMensaje('Conservaste la reserva. Tu lugar sigue confirmado.') }}>Conservar reserva</button>
                    <button type="button" className="crud-danger" onClick={() => cancelar(reserva)}>Sí, cancelar</button>
                  </div>
                </div>
              ) : <div className="client-section-row"><span className="client-card-note">Tu lugar está reservado</span><button type="button" className="crud-secondary" aria-label={'Cancelar reserva de ' + reserva.clase.nombre + ' del ' + reserva.fecha} onClick={() => setCancelacion(reserva.id)}>Cancelar reserva</button></div>}
            </article>
          ))}
        </div>
        {proximas.length === 0 && <div className="empty-state"><p>Todavía no tenés reservas para próximas clases.</p><button type="button" className="crud-primary" onClick={onVerClases}>Explorar clases</button></div>}
      </section>

      <section className="client-history" aria-label="Historial de reservas">
        <div className="client-section-row"><h2>Historial</h2><button type="button" className="client-text-button" aria-expanded={verHistorial} aria-controls="reservas-anteriores" onClick={() => setVerHistorial(!verHistorial)}>{verHistorial ? 'Ocultar anteriores' : 'Ver anteriores'} ({anteriores.length})</button></div>
        {verHistorial && <div id="reservas-anteriores" className="client-card-grid">
          {anteriores.map((reserva) => (
            <article className="client-card client-past" key={reserva.id}>
              <span className="client-pill client-pill-muted">Turno pasado</span>
              <h3>{reserva.clase?.nombre || 'Clase no disponible'}</h3>
              <p>{fechaLarga(reserva.fecha)} · {reserva.clase?.horario || 'Sin horario'}</p>
              <p>Reserva histórica; no se puede cancelar desde esta vista.</p>
            </article>
          ))}
          {anteriores.length === 0 && <p className="empty-state">Todavía no hay reservas anteriores en tu historial.</p>}
        </div>}
      </section>
    </>
  )
}

export default MisReservas
