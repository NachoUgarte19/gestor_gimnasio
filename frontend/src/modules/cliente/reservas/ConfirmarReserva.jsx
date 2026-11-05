import { claseComenzada, fechaLarga, lugaresDisponibles } from '../clienteUtils.js'

// Muestra un resumen del turno. El guardado real de la demo lo realiza la funcion onConfirmar del padre.
function ConfirmarReserva({ seleccion, socio, clases, planes, reservas, onConfirmar, onVolver }) {
  // Consultamos la clase actual, no una copia de cuando se tocó Reservar.
  const clase = clases.find((item) => item.id === seleccion.claseId)
  const plan = planes.find((item) => item.id === socio.planId)
  const libres = clase ? lugaresDisponibles(clase, seleccion.fecha, reservas) : 0
  const repetida = reservas.some((reserva) => reserva.socioId === socio.id && reserva.claseId === seleccion.claseId && reserva.fecha === seleccion.fecha)
  const comenzo = clase && claseComenzada(clase, seleccion.fecha)

  return (
    <>
      <button type="button" className="client-text-button client-back" onClick={onVolver}>‹ Volver a clases</button>
      <header className="client-page-header">
        <p className="eyebrow">Nueva reserva</p>
        <h1>Confirmá tu lugar</h1>
        <p>Revisá la clase antes de anotarte.</p>
      </header>
      {clase ? (
        <section className="client-confirm" aria-label="Detalle de la reserva a confirmar">
          <h2>{clase.nombre}</h2>
          <dl className="client-details">
            <div><dt>Día</dt><dd>{fechaLarga(seleccion.fecha)}</dd></div>
            <div><dt>Horario</dt><dd>{clase.horario}</dd></div>
            <div><dt>Instructor</dt><dd>{clase.instructor}</dd></div>
            <div><dt>Socio</dt><dd>{socio.nombre} {socio.apellido}</dd></div>
            <div><dt>Tu plan</dt><dd>{plan?.nombre || 'Sin plan asignado'}</dd></div>
          </dl>
          <p className="client-spots">{libres} lugares disponibles</p>
          <p className="client-card-note">La reserva corresponde a esta fecha. Tu plan no limita las clases disponibles.</p>
          {(!socio.activo || repetida || comenzo || libres === 0) && <p role="status">{!socio.activo ? 'Tu cuenta está inactiva.' : repetida ? 'Ya tenés una reserva para este turno.' : comenzo ? 'La clase ya comenzó.' : 'Este turno está completo.'}</p>}
          <button type="button" className="crud-primary client-wide-button" disabled={!socio.activo || repetida || comenzo || libres === 0} onClick={onConfirmar}>Confirmar reserva</button>
        </section>
      ) : <p className="empty-state">La clase ya no está disponible. Volvé al listado para elegir otra.</p>}
    </>
  )
}

export default ConfirmarReserva
