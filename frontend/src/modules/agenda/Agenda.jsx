import { Fragment, useState } from 'react'
import Encabezado from '../../components/Encabezado.jsx'
import { diasSemana, fechaTexto, inicioSemana, sumarDias } from '../../utils/fechas.js'
import './Agenda.css'

const formatoDia = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const formatoFecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

// Recibe clases y reservas compartidas. La disponibilidad se calcula al dibujar, sin guardar otra lista.
function Agenda({ clases, reservas }) {
  const [lunes, setLunes] = useState(() => inicioSemana(new Date()))
  // Crea los siete dias a partir del lunes elegido para mostrar la semana completa.
  const dias = Array.from({ length: 7 }, (_, indice) => sumarDias(lunes, indice))
  // Set elimina horarios repetidos y sort los ordena para construir las filas del calendario.
  const horarios = [...new Set(clases.map((clase) => clase.horario))].sort()
  const reservasSemana = reservas.filter((reserva) => reserva.fecha >= fechaTexto(dias[0]) && reserva.fecha <= fechaTexto(dias[6]))

  // Esta función usa las mismas listas que Reservas. El cupo cambia al instante.
  // Cuenta inscripciones del turno y devuelve su tarjeta. compacta adapta el nivel del titulo en celular.
  function tarjeta(clase, fecha, compacta = false) {
    const ocupados = reservas.filter((reserva) => reserva.claseId === clase.id && reserva.fecha === fecha).length
    const libres = Math.max(0, clase.cupo - ocupados)
    const estado = libres === 0 ? 'full' : libres <= 3 ? 'few' : 'available'
    const Titulo = compacta ? 'h4' : 'h3'
    return (
      <article className={'class-card ' + estado} key={clase.id} aria-label={clase.nombre + ', ' + clase.horario + ', ' + libres + ' lugares libres de ' + clase.cupo}>
        <Titulo>{clase.nombre}</Titulo>
        <span>{clase.horario} · {clase.instructor}</span>
        <small>{libres === 0 ? 'Completa' : libres + ' lugares libres'} · {ocupados}/{clase.cupo}</small>
      </article>
    )
  }

  return (
    <>
      <Encabezado titulo="Agenda de clases" descripcion="Consultá los horarios y los lugares disponibles de cada semana." />
      <div className="toolbar">
        <div className="week-controls">
          <button type="button" className="icon-button" onClick={() => setLunes(sumarDias(lunes, -7))} aria-label="Semana anterior">‹</button>
          <button type="button" className="icon-button" onClick={() => setLunes(sumarDias(lunes, 7))} aria-label="Semana siguiente">›</button>
          <strong aria-live="polite">{formatoFecha.format(dias[0])} – {formatoFecha.format(dias[6])}</strong>
          <button type="button" className="light-button" onClick={() => setLunes(inicioSemana(new Date()))}>Hoy</button>
        </div>
        <div className="legend" aria-label="Estados de cupo">
          <span><i className="dot available" aria-hidden="true" /> Disponible</span>
          <span><i className="dot few" aria-hidden="true" /> Pocos lugares</span>
          <span><i className="dot full" aria-hidden="true" /> Completa</span>
        </div>
      </div>
      <h2 className="section-title">Programación semanal</h2>
      <p className="form-help">{reservasSemana.length} reservas para esta semana. Administrá los turnos desde Clases y las inscripciones desde Reservas.</p>
      {clases.length === 0 ? <p className="empty-state">Todavía no hay clases programadas. Agregá la primera desde Clases.</p> : (
        <>
          <div className="calendar-scroll" role="region" aria-label="Calendario semanal, desplazamiento horizontal" tabIndex="0">
            <div className="calendar-grid">
              <div className="corner-cell">Hora</div>
              {dias.map((dia) => <div className="day-heading" key={fechaTexto(dia)}><span>{formatoDia.format(dia)}</span><strong>{dia.getDate()}</strong></div>)}
              {horarios.map((hora) => (
                <Fragment key={hora}>
                  <div className="time-cell">{hora}</div>
                  {dias.map((dia, indice) => (
                    <div className="calendar-cell" key={fechaTexto(dia)}>
                      {clases.filter((clase) => clase.dia === diasSemana[indice] && clase.horario === hora).map((clase) => tarjeta(clase, fechaTexto(dia)))}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
          {/* En celulares mostramos los mismos datos agrupados por día, sin una grilla ancha. */}
          <div className="agenda-mobile">
            {dias.map((dia, indice) => {
              const delDia = clases.filter((clase) => clase.dia === diasSemana[indice]).sort((a, b) => a.horario.localeCompare(b.horario))
              return <section className="agenda-day" key={fechaTexto(dia)}>
                <h3>{diasSemana[indice]} {dia.getDate()}</h3>
                {delDia.length ? delDia.map((clase) => tarjeta(clase, fechaTexto(dia), true)) : <p>Sin clases programadas.</p>}
              </section>
            })}
          </div>
        </>
      )}
    </>
  )
}

export default Agenda
