import { useState } from 'react'
import Encabezado from '../../components/Encabezado.jsx'
import Mensaje from '../../components/Mensaje.jsx'
import { diaDeFecha, fechaTexto, mostrarFecha } from '../../utils/fechas.js'
import { nombreSocio, normalizar, siguienteId } from '../../utils/listas.js'
import { validarReserva } from '../../utils/validaciones.js'
import '../../styles/Listados.css'
import '../../styles/Crud.css'

// La lista llega por props desde App; los estados locales controlan filtros, borrador y mensajes.
function Reservas({ lista, setLista, socios, clases }) {
  const [busqueda, setBusqueda] = useState('')
  const [fecha, setFecha] = useState('')
  // null significa formulario cerrado; un objeto representa el borrador abierto.
  const [formulario, setFormulario] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const activos = socios.filter((socio) => socio.activo)
  // Este resultado se recalcula al cambiar datos o filtros; no modifica la lista original.
  const visibles = lista.filter((reserva) => {
    const clase = clases.find((item) => item.id === reserva.claseId)
    const texto = nombreSocio(socios, reserva.socioId) + ' ' + (clase?.nombre || '') + ' ' + (clase?.instructor || '')
    return normalizar(texto).includes(normalizar(busqueda)) && (!fecha || reserva.fecha === fecha)
  }).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id)

  // Busca la clase del borrador para anticipar el dia correcto y los lugares libres antes de guardar.
  const claseElegida = clases.find((clase) => clase.id === formulario?.claseId)
  const ocupados = formulario ? lista.filter((reserva) => reserva.id !== formulario.id && reserva.claseId === formulario.claseId && reserva.fecha === formulario.fecha).length : 0
  const lugares = claseElegida ? Math.max(0, claseElegida.cupo - ocupados) : 0
  const fechaCorrecta = formulario?.fecha && claseElegida && diaDeFecha(formulario.fecha) === claseElegida.dia

  // Con un registro copia el reserva para editar; sin argumento prepara un alta con valores iniciales.
  function abrir(reserva) {
    setFormulario(reserva ? { ...reserva } : { id: null, socioId: '', claseId: '', fecha: fechaTexto() })
    setError('')
    setMensaje('')
  }

  // Actualiza un solo campo del borrador y retira el error anterior para permitir corregirlo.
  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
    setError('')
  }

  // Prepara y valida el reserva. setLista comunica la nueva lista al padre y actualiza las otras pantallas.
  function guardar(evento) {
    evento.preventDefault()
    const fallo = validarReserva(formulario, socios, clases, lista)
    if (fallo) return setError(fallo)
    if (formulario.id === null) setLista([...lista, { ...formulario, id: siguienteId(lista) }])
    else setLista(lista.map((reserva) => reserva.id === formulario.id ? formulario : reserva))
    setMensaje(formulario.id === null ? 'Reserva registrada. El cupo de la agenda se actualizó.' : 'Reserva actualizada. El cupo de la agenda se actualizó.')
    setFormulario(null)
    setBusqueda('')
    setFecha('')
  }

  // Revisa las condiciones y pide confirmacion antes de quitar el registro de la lista compartida.
  function cancelar(reserva) {
    if (!window.confirm('¿Cancelar la reserva de ' + nombreSocio(socios, reserva.socioId) + ' del ' + mostrarFecha(reserva.fecha) + '?')) return
    setLista(lista.filter((item) => item.id !== reserva.id))
    if (formulario?.id === reserva.id) setFormulario(null)
    setError('')
    setMensaje('Reserva cancelada. El lugar volvió a estar disponible.')
  }

  return (
    <>
      <Encabezado titulo="Reservas" descripcion="Registrá la asistencia a una clase para una fecha concreta." />
      <section className="listado-resumen" aria-label="Resumen de reservas">
        <div className="resumen-card"><span>Reservas registradas</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Para hoy</span><strong>{lista.filter((reserva) => reserva.fecha === fechaTexto()).length}</strong></div>
        <div className="resumen-card"><span>Después de hoy</span><strong>{lista.filter((reserva) => reserva.fecha > fechaTexto()).length}</strong></div>
      </section>
      <Mensaje texto={mensaje} /><Mensaje texto={error} error />
      {(activos.length === 0 || clases.length === 0) && <p className="empty-state">Para registrar una reserva necesitás al menos un socio activo y una clase. Podés crearlos desde Socios y Clases.</p>}
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de reserva">
          <h2>{formulario.id === null ? 'Nueva reserva' : 'Editar reserva'}</h2>
          <p className="form-help">Todos los campos son obligatorios. Solo pueden reservar los socios activos, independientemente de su plan.</p>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Socio *
                <select autoFocus required value={formulario.socioId} onChange={(e) => cambiar('socioId', e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Elegir socio</option>
                  {/* Mostramos los inactivos para explicar por qué no pueden reservar. */}
                  {socios.map((socio) => <option key={socio.id} value={socio.id}>{socio.nombre} {socio.apellido} · DNI {socio.dni}{socio.activo ? '' : ' · Inactivo'}</option>)}
                </select>
              </label>
              <label>Clase *
                <select required value={formulario.claseId} onChange={(e) => cambiar('claseId', e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Elegir clase</option>
                  {clases.map((clase) => <option key={clase.id} value={clase.id}>{clase.nombre} · {clase.dia} {clase.horario}</option>)}
                </select>
              </label>
              <label>Fecha de asistencia *<input type="date" required value={formulario.fecha} onInput={(e) => cambiar('fecha', e.target.value)} /></label>
            </div>
            {/* Esta ayuda anticipa el resultado antes de presionar Guardar. */}
            {claseElegida && <p className="form-help" role="status">{claseElegida.nombre} se dicta los {claseElegida.dia.toLowerCase()} a las {claseElegida.horario}. {fechaCorrecta ? lugares + ' lugares disponibles para la fecha elegida (sin contar esta reserva).' : 'Elegí una fecha que coincida con ese día.'}</p>}
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => { setFormulario(null); setError(''); setMensaje('Edición cancelada. No se guardaron cambios.') }}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar reserva</button>
            </div>
          </form>
        </section>
      )}
      <section className="listado-panel" aria-label="Listado de reservas">
        <div className="listado-panel-header">
          <div><h2>Listado de reservas</h2><p>Mostrando {visibles.length} de {lista.length} reservas</p></div>
          <div className="crud-toolbar">
            <div className="listado-busqueda"><label htmlFor="buscar-reserva">Buscar reserva</label><input id="buscar-reserva" type="search" placeholder="Socio, clase o instructor" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
            <div className="listado-filtro"><label htmlFor="fecha-reserva">Fecha</label><input id="fecha-reserva" type="date" value={fecha} onInput={(e) => setFecha(e.target.value)} /></div>
            {fecha && <button type="button" className="crud-secondary" onClick={() => setFecha('')}>Todas las fechas</button>}
            <button type="button" className="crud-primary" disabled={activos.length === 0 || clases.length === 0} onClick={() => abrir()}>Nueva reserva</button>
          </div>
        </div>
        <p className="table-hint">En pantallas pequeñas, desplazá la tabla hacia los lados para ver todas las columnas y acciones.</p>
        <div className="listado-tabla-scroll" role="region" aria-label="Tabla de reservas, desplazamiento horizontal" tabIndex="0">
          <table className="listado-tabla">
            <caption className="sr-only">Reservas de los socios por clase y fecha</caption>
            <thead><tr>{['Socio', 'Clase', 'Fecha', 'Horario', 'Acciones'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
            <tbody>
              {visibles.map((reserva) => {
                const clase = clases.find((item) => item.id === reserva.claseId)
                return (
                  <tr key={reserva.id}>
                    <td><strong>{nombreSocio(socios, reserva.socioId)}</strong></td><td>{clase?.nombre || 'Clase no disponible'}</td><td>{mostrarFecha(reserva.fecha)}</td><td>{clase?.horario || '—'}</td>
                    <td><div className="crud-actions">
                      <button type="button" className="crud-secondary" aria-label={'Editar reserva ' + reserva.id + ' de ' + nombreSocio(socios, reserva.socioId)} onClick={() => abrir(reserva)}>Editar</button>
                      <button type="button" className="crud-danger" aria-label={'Cancelar reserva ' + reserva.id + ' de ' + nombreSocio(socios, reserva.socioId)} onClick={() => cancelar(reserva)}>Cancelar reserva</button>
                    </div></td>
                  </tr>
                )
              })}
              {visibles.length === 0 && <tr><td className="sin-resultados" colSpan="5">{lista.length ? 'No hay reservas que coincidan con los filtros.' : 'Todavía no hay reservas. Registrá la primera con Nueva reserva.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default Reservas
