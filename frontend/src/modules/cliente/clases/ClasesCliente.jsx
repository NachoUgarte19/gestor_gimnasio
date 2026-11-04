import { useState } from 'react'
import { diasSemana, fechaTexto, inicioSemana, leerFecha, sumarDias } from '../../../utils/fechas.js'
import { normalizar } from '../../../utils/listas.js'
import { claseComenzada, fechaLarga, lugaresDisponibles, reservasDelSocio } from '../clienteUtils.js'

function ClasesCliente({ socio, planes, clases, reservas, onReservar, onVerReservas, onVerPerfil }) {
  const [fecha, setFecha] = useState(fechaTexto())
  const [busqueda, setBusqueda] = useState('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const lunes = inicioSemana(leerFecha(fecha))
  const dias = Array.from({ length: 7 }, (_, indice) => sumarDias(lunes, indice))
  const diaElegido = diasSemana[(leerFecha(fecha).getDay() + 6) % 7]
  const plan = planes.find((item) => item.id === socio.planId)
  const ahora = new Date()
  const proxima = reservasDelSocio(reservas, clases, socio.id).find((reserva) => reserva.clase && !claseComenzada(reserva.clase, reserva.fecha, ahora))
  const visibles = clases.filter((clase) => {
    const coincide = clase.dia === diaElegido && normalizar(clase.nombre + ' ' + clase.instructor).includes(normalizar(busqueda))
    return coincide && (!soloDisponibles || (lugaresDisponibles(clase, fecha, reservas) > 0 && !claseComenzada(clase, fecha, ahora)))
  }).sort((a, b) => a.horario.localeCompare(b.horario))

  function cambiarSemana(cantidad) {
    setFecha(fechaTexto(sumarDias(leerFecha(fecha), cantidad * 7)))
  }

  return (
    <>
      <header className="client-page-header">
        <p className="eyebrow">{fechaLarga(fechaTexto())}</p>
        <h1>Hola, {socio.nombre}</h1>
        <p>Elegí una clase y reservá tu lugar.</p>
        <span className={'client-pill' + (socio.activo ? '' : ' client-pill-muted')}>
          {socio.activo ? (plan?.nombre || 'Sin plan asignado') + ' · Socio activo' : 'Socio inactivo'}
        </span>
      </header>

      {!socio.activo && (
        <aside className="client-notice" aria-label="Estado de tu cuenta">
          <p>Tu cuenta está inactiva. Podés consultar las clases, tu perfil y tus reservas, pero necesitás que recepción te active para hacer nuevas reservas.</p>
          <button type="button" className="client-text-button" onClick={onVerPerfil}>Ver mi perfil</button>
        </aside>
      )}

      <section aria-label="Elegir día y buscar clases">
        <div className="client-section-row">
          <h2>Clases de la semana</h2>
          <div className="client-week-controls">
            <button type="button" className="crud-secondary" aria-label="Semana anterior" onClick={() => cambiarSemana(-1)}>‹</button>
            <button type="button" className="crud-secondary" onClick={() => setFecha(fechaTexto())}>Hoy</button>
            <button type="button" className="crud-secondary" aria-label="Semana siguiente" onClick={() => cambiarSemana(1)}>›</button>
          </div>
        </div>
        <p className="client-week-label" aria-live="polite">{dias[0].toLocaleDateString('es-AR')} – {dias[6].toLocaleDateString('es-AR')}</p>
        <div className="client-days" role="group" aria-label="Días de la semana">
          {dias.map((dia, indice) => (
            <button key={fechaTexto(dia)} type="button" className={'client-day' + (fechaTexto(dia) === fecha ? ' selected' : '')}
              aria-label={fechaLarga(fechaTexto(dia))} aria-pressed={fechaTexto(dia) === fecha} onClick={() => setFecha(fechaTexto(dia))}>
              <span>{diasSemana[indice].slice(0, 3)}</span><strong>{dia.getDate()}</strong>
            </button>
          ))}
        </div>
        <div className="client-filters">
          <label htmlFor="buscar-cliente">Buscar clase o instructor</label>
          <input id="buscar-cliente" type="search" placeholder="Por ejemplo, Yoga" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <label className="client-checkbox"><input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} />Solo turnos futuros con lugares</label>
          {(busqueda || soloDisponibles) && <button type="button" className="client-text-button" onClick={() => { setBusqueda(''); setSoloDisponibles(false) }}>Limpiar filtros</button>}
        </div>
      </section>

      <section aria-label="Clases del día elegido">
        <div className="client-section-row">
          <h2>{diaElegido} {leerFecha(fecha).getDate()}</h2>
          <span>{visibles.length} {visibles.length === 1 ? 'clase' : 'clases'}</span>
        </div>
        <div className="client-card-grid">
          {visibles.map((clase) => {
            const libres = lugaresDisponibles(clase, fecha, reservas)
            const reservada = reservas.some((reserva) => reserva.socioId === socio.id && reserva.claseId === clase.id && reserva.fecha === fecha)
            const comenzo = claseComenzada(clase, fecha, ahora)
            const impedida = !socio.activo || libres === 0 || comenzo
            let textoBoton = 'Reservar lugar'
            if (comenzo) textoBoton = 'La clase ya comenzó'
            else if (reservada) textoBoton = 'Ver mi reserva'
            else if (!socio.activo) textoBoton = 'Cuenta inactiva'
            else if (libres === 0) textoBoton = 'Clase completa'
            return (
              <article className="client-card" key={clase.id}>
                <div className="client-section-row"><span className="client-time">{clase.horario}</span><span className={'client-spots' + (libres === 0 ? ' full' : '')}>{libres === 0 ? 'Completa' : libres + ' lugares libres'}</span></div>
                <h3>{clase.nombre}</h3>
                <p>Con {clase.instructor}</p>
                <p className="client-card-note">Cupo: {clase.cupo} personas{reservada ? ' · Ya tenés tu lugar' : ''}</p>
                <button type="button" className="crud-primary client-wide-button" disabled={reservada ? comenzo : impedida}
                  aria-label={textoBoton + ' · ' + clase.nombre + ' ' + clase.horario}
                  onClick={() => reservada ? onVerReservas() : onReservar({ claseId: clase.id, fecha })}>{textoBoton}</button>
              </article>
            )
          })}
        </div>
        {visibles.length === 0 && <div className="empty-state">{clases.length === 0 ? 'Todavía no hay clases programadas. Volvé a consultar más adelante.' : 'No hay clases para este día con los filtros elegidos. Probá otra fecha o limpiá la búsqueda.'}</div>}
      </section>

      {proxima && <aside className="client-next">
        <h2>Tu próxima clase</h2>
        <p><strong>{proxima.clase.nombre}</strong> · {fechaLarga(proxima.fecha)} · {proxima.clase.horario}</p>
        <button type="button" className="client-text-button" onClick={onVerReservas}>Ver mis reservas</button>
      </aside>}
    </>
  )
}

export default ClasesCliente
