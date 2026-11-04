import { useState } from 'react'
import Encabezado from '../../components/Encabezado.jsx'
import Mensaje from '../../components/Mensaje.jsx'
import { diasSemana } from '../../utils/fechas.js'
import { normalizar, siguienteId } from '../../utils/listas.js'
import { validarClase } from '../../utils/validaciones.js'
import '../../styles/Listados.css'
import '../../styles/Crud.css'

function Clases({ lista, setLista, reservas }) {
  const [busqueda, setBusqueda] = useState('')
  const [dia, setDia] = useState('')
  const [formulario, setFormulario] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const visibles = lista.filter((clase) =>
    normalizar(clase.nombre + ' ' + clase.instructor + ' ' + clase.dia).includes(normalizar(busqueda)) && (!dia || clase.dia === dia)
  )
  const mañana = lista.filter((clase) => clase.horario < '12:00').length

  function abrir(clase) {
    setFormulario(clase ? { ...clase } : { id: null, nombre: '', instructor: '', dia: 'Lunes', horario: '', cupo: '' })
    setError('')
    setMensaje('')
  }

  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
    setError('')
  }

  function guardar(evento) {
    evento.preventDefault()
    const datos = { ...formulario, nombre: formulario.nombre.trim(), instructor: formulario.instructor.trim(), cupo: Number(formulario.cupo) }
    const fallo = validarClase(datos, lista, reservas)
    if (fallo) return setError(fallo)
    if (datos.id === null) setLista([...lista, { ...datos, id: siguienteId(lista) }])
    else setLista(lista.map((clase) => clase.id === datos.id ? datos : clase))
    setMensaje(datos.id === null ? 'Clase creada. Ya aparece en la agenda semanal.' : 'Clase actualizada. La agenda y las reservas reflejan los cambios.')
    setFormulario(null)
    setBusqueda('')
    setDia('')
  }

  function eliminar(clase) {
    if (reservas.some((reserva) => reserva.claseId === clase.id)) {
      setMensaje('')
      return setError('Esta clase tiene reservas. Cancelalas desde Reservas antes de eliminarla.')
    }
    if (!window.confirm('¿Eliminar ' + clase.nombre + ' del ' + clase.dia + ' a las ' + clase.horario + '?')) return
    setLista(lista.filter((item) => item.id !== clase.id))
    if (formulario?.id === clase.id) setFormulario(null)
    setError('')
    setMensaje('Clase eliminada de la agenda.')
  }

  return (
    <>
      <Encabezado titulo="Clases" descripcion="Organizá los horarios semanales, instructores y cupos." />
      <section className="listado-resumen" aria-label="Resumen de clases">
        <div className="resumen-card"><span>Clases semanales</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Por la mañana</span><strong>{mañana}</strong></div>
        <div className="resumen-card"><span>Desde el mediodía</span><strong>{lista.length - mañana}</strong></div>
      </section>
      <Mensaje texto={mensaje} /><Mensaje texto={error} error />
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de clase">
          <h2>{formulario.id === null ? 'Nueva clase' : 'Editar clase'}</h2>
          <p className="form-help">Todos los campos son obligatorios. La clase se repite cada semana.</p>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Nombre *<input autoFocus required maxLength="100" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} /></label>
              <label>Instructor *<input required maxLength="100" value={formulario.instructor} onChange={(e) => cambiar('instructor', e.target.value)} /></label>
              <label>Día *<select value={formulario.dia} onChange={(e) => cambiar('dia', e.target.value)}>{diasSemana.map((nombre) => <option key={nombre}>{nombre}</option>)}</select></label>
              <label>Horario *<input type="time" required value={formulario.horario} onInput={(e) => cambiar('horario', e.target.value)} /></label>
              <label>Cupo por fecha *<input type="number" min="1" step="1" required value={formulario.cupo} onChange={(e) => cambiar('cupo', e.target.value)} /></label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => { setFormulario(null); setError(''); setMensaje('Edición cancelada. No se guardaron cambios.') }}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar clase</button>
            </div>
          </form>
        </section>
      )}
      <section className="listado-panel" aria-label="Listado de clases">
        <div className="listado-panel-header">
          <div><h2>Listado de clases</h2><p>Mostrando {visibles.length} de {lista.length} clases</p></div>
          <div className="crud-toolbar">
            <div className="listado-busqueda"><label htmlFor="buscar-clase">Buscar clase</label><input id="buscar-clase" type="search" placeholder="Clase, instructor o día" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
            <div className="listado-filtro"><label htmlFor="dia-clase">Día</label><select id="dia-clase" value={dia} onChange={(e) => setDia(e.target.value)}><option value="">Todos</option>{diasSemana.map((nombre) => <option key={nombre}>{nombre}</option>)}</select></div>
            <button type="button" className="crud-primary" onClick={() => abrir()}>Nueva clase</button>
          </div>
        </div>
        <p className="table-hint">En pantallas pequeñas, desplazá la tabla hacia los lados para ver todas las columnas y acciones.</p>
        <div className="listado-tabla-scroll" role="region" aria-label="Tabla de clases, desplazamiento horizontal" tabIndex="0">
          <table className="listado-tabla">
            <caption className="sr-only">Clases semanales y cupo por fecha</caption>
            <thead><tr>{['Clase', 'Instructor', 'Día', 'Horario', 'Cupo', 'Acciones'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
            <tbody>
              {visibles.map((clase) => (
                <tr key={clase.id}>
                  <td><strong>{clase.nombre}</strong></td><td>{clase.instructor}</td><td>{clase.dia}</td><td>{clase.horario}</td><td>{clase.cupo} lugares</td>
                  <td><div className="crud-actions">
                    <button type="button" className="crud-secondary" aria-label={'Editar ' + clase.nombre + ' del ' + clase.dia} onClick={() => abrir(clase)}>Editar</button>
                    <button type="button" className="crud-danger" aria-label={'Eliminar ' + clase.nombre + ' del ' + clase.dia} onClick={() => eliminar(clase)}>Eliminar</button>
                  </div></td>
                </tr>
              ))}
              {visibles.length === 0 && <tr><td className="sin-resultados" colSpan="6">{lista.length ? 'No hay clases que coincidan con los filtros.' : 'Todavía no hay clases. Agregá la primera con Nueva clase.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default Clases
