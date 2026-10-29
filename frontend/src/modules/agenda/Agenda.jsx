import { Fragment, useEffect, useState } from 'react'
import './Agenda.css'

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const formatoDia = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const formatoFecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

function sumarDias(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + cantidad)
}

function inicioSemana(fecha) {
  return sumarDias(fecha, -((fecha.getDay() + 6) % 7))
}

// La API usa fechas YYYY-MM-DD. Se arma con la fecha local para evitar cambios de día por UTC.
function fechaApi(fecha) {
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

function normalizarDia(dia) {
  return dia.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function Agenda() {
  const [lunes, setLunes] = useState(() => inicioSemana(new Date()))
  const [clases, setClases] = useState([])
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarAgenda() {
      try {
        const [respuestaClases, respuestaReservas] = await Promise.all([
          fetch('/api/clases', { signal: controlador.signal }),
          fetch('/api/reservas', { signal: controlador.signal }),
        ])
        if (!respuestaClases.ok || !respuestaReservas.ok) {
          throw new Error('La API no respondió correctamente.')
        }

        const [clasesRecibidas, reservasRecibidas] = await Promise.all([
          respuestaClases.json(),
          respuestaReservas.json(),
        ])
        if (!Array.isArray(clasesRecibidas) || !Array.isArray(reservasRecibidas)) {
          throw new Error('La API devolvió un formato inesperado.')
        }

        setClases(clasesRecibidas)
        setReservas(reservasRecibidas)
      } catch (fallo) {
        if (fallo.name !== 'AbortError') setError('No se pudo cargar la agenda. Revisá que el backend y MySQL estén iniciados.')
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    cargarAgenda()
    return () => controlador.abort()
  }, [])

  const dias = Array.from({ length: 7 }, (_, indice) => sumarDias(lunes, indice))
  const horarios = [...new Set(clases.map((clase) => clase.horario))].sort()

  // Cada reserva ocupa un lugar únicamente en la fecha en que se hizo.
  const reservasPorTurno = new Map()
  for (const reserva of reservas) {
    const clave = `${reserva.clase.id}|${reserva.fecha}`
    reservasPorTurno.set(clave, (reservasPorTurno.get(clave) ?? 0) + 1)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1>Agenda de clases</h1>
          <p className="subtitle">Horarios y lugares disponibles de la semana.</p>
        </div>
        <div className="user-badge"><span>R</span> Recepción</div>
      </header>

      <div className="toolbar">
        <div className="week-controls">
          <button type="button" className="icon-button" onClick={() => setLunes(sumarDias(lunes, -7))} aria-label="Semana anterior">‹</button>
          <button type="button" className="icon-button" onClick={() => setLunes(sumarDias(lunes, 7))} aria-label="Semana siguiente">›</button>
          <strong>{formatoFecha.format(dias[0])} – {formatoFecha.format(dias[6])}</strong>
          <button type="button" className="light-button" onClick={() => setLunes(inicioSemana(new Date()))}>Hoy</button>
        </div>
        <div className="legend" aria-label="Estados de cupo">
          <span><i className="dot available" /> Disponible</span>
          <span><i className="dot few" /> Pocos lugares</span>
          <span><i className="dot full" /> Completa</span>
        </div>
      </div>

      {cargando && <p role="status">Cargando agenda…</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && clases.length === 0 && <p>No hay clases cargadas en la base de datos.</p>}

      {!cargando && !error && clases.length > 0 && (
        <div className="calendar-scroll">
          <div className="calendar-grid" aria-label="Agenda semanal">
            <div className="corner-cell">Hora</div>
            {dias.map((dia) => (
              <div className="day-heading" key={fechaApi(dia)}>
                <span>{formatoDia.format(dia)}</span>
                <strong>{dia.getDate()}</strong>
              </div>
            ))}

            {horarios.map((hora) => (
              <Fragment key={hora}>
                <div className="time-cell">{hora}</div>
                {dias.map((dia, indice) => {
                  const fecha = fechaApi(dia)
                  const clasesDelTurno = clases.filter((clase) =>
                    normalizarDia(clase.dia) === diasSemana[indice] && clase.horario === hora
                  )

                  return (
                    <div className="calendar-cell" key={fecha}>
                      {clasesDelTurno.map((clase) => {
                        const ocupados = reservasPorTurno.get(`${clase.id}|${fecha}`) ?? 0
                        const lugares = Math.max(0, clase.cupo - ocupados)
                        const estado = lugares === 0 ? 'full' : lugares <= 3 ? 'few' : 'available'

                        return (
                          <div className={'class-card ' + estado} key={clase.id}>
                            <strong>{clase.nombre}</strong>
                            <span>{clase.horario} · {clase.instructor}</span>
                            <small>{lugares === 0 ? 'Completa' : lugares + ' lugares libres'}</small>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default Agenda
