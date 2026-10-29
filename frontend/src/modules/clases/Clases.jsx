import { useState } from 'react'
import '../../styles/Listados.css'
import '../../styles/Crud.css'

// Clases iniciales de ejemplo. Por ahora no se leen del backend.
const clasesIniciales = [
  { id: 1, nombre: 'Funcional', instructor: 'Lucía Gómez', dia: 'Lunes', horario: '08:00', cupo: 12 },
  { id: 2, nombre: 'Yoga', instructor: 'Martina Díaz', dia: 'Martes', horario: '09:00', cupo: 10 },
  { id: 3, nombre: 'Spinning', instructor: 'Nicolás Ruiz', dia: 'Miércoles', horario: '18:00', cupo: 8 },
  { id: 4, nombre: 'Pilates', instructor: 'Carla López', dia: 'Jueves', horario: '17:00', cupo: 12 },
  { id: 5, nombre: 'Funcional', instructor: 'Lucía Gómez', dia: 'Viernes', horario: '08:00', cupo: 12 },
  { id: 6, nombre: 'Yoga', instructor: 'Martina Díaz', dia: 'Sábado', horario: '10:00', cupo: 10 },
]

function Clases() {
  // lista cambia cuando creamos, editamos o eliminamos una clase.
  const [lista, setLista] = useState(clasesIniciales)
  const [siguienteId, setSiguienteId] = useState(clasesIniciales.length + 1)
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState(null)

  const texto = busqueda.trim().toLowerCase()
  const visibles = lista.filter((clase) => {
    const datos = (clase.nombre + ' ' + clase.instructor + ' ' + clase.dia).toLowerCase()
    return datos.includes(texto)
  })
  // Las horas están siempre en formato HH:MM, por eso esta comparación funciona.
  const mañana = lista.filter((clase) => clase.horario < '12:00').length

  function nueva() {
    setFormulario({ id: null, nombre: '', instructor: '', dia: 'Lunes', horario: '', cupo: '' })
  }

  function editar(clase) {
    setFormulario({ ...clase })
  }

  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
  }

  function guardar(evento) {
    evento.preventDefault()
    // Los inputs numéricos entregan texto; convertimos cupo a número al guardar.
    const datos = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      instructor: formulario.instructor.trim(),
      cupo: Number(formulario.cupo),
    }
    if (formulario.id === null) {
      setLista([...lista, { ...datos, id: siguienteId }])
      setSiguienteId(siguienteId + 1)
    } else {
      setLista(lista.map((clase) => clase.id === formulario.id ? datos : clase))
    }
    setFormulario(null)
    setBusqueda('')
  }

  function eliminar(clase) {
    if (!window.confirm('¿Eliminar la clase ' + clase.nombre + ' del ' + clase.dia + '?')) return
    setLista(lista.filter((item) => item.id !== clase.id))
    if (formulario?.id === clase.id) setFormulario(null)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión · Datos de ejemplo</p>
          <h1>Clases</h1>
          <p className="subtitle">Horarios semanales, instructores y cupos.</p>
        </div>
        <div className="user-badge"><span>R</span> Recepción</div>
      </header>

      <section className="listado-resumen" aria-label="Resumen de clases">
        <div className="resumen-card"><span>Clases semanales</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Por la mañana</span><strong>{mañana}</strong></div>
        <div className="resumen-card"><span>Por la tarde</span><strong>{lista.length - mañana}</strong></div>
      </section>

      {/* id null: crear; id con número: editar. */}
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de clase">
          <h2>{formulario.id === null ? 'Nueva clase' : 'Editar clase'}</h2>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Nombre
                <input required value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
              </label>
              <label>Instructor
                <input required value={formulario.instructor} onChange={(e) => cambiar('instructor', e.target.value)} />
              </label>
              <label>Día
                <select value={formulario.dia} onChange={(e) => cambiar('dia', e.target.value)}>
                  <option>Lunes</option>
                  <option>Martes</option>
                  <option>Miércoles</option>
                  <option>Jueves</option>
                  <option>Viernes</option>
                  <option>Sábado</option>
                  <option>Domingo</option>
                </select>
              </label>
              <label>Horario
                <input type="time" required value={formulario.horario} onChange={(e) => cambiar('horario', e.target.value)} />
              </label>
              <label>Cupo
                <input type="number" min="1" step="1" required value={formulario.cupo} onChange={(e) => cambiar('cupo', e.target.value)} />
              </label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => setFormulario(null)}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar clase</button>
            </div>
          </form>
        </section>
      )}

      <section className="listado-panel" aria-label="Listado de clases">
        <div className="listado-panel-header">
          <div>
            <h2>Listado de clases</h2>
            <p>Mostrando {visibles.length} de {lista.length} clases</p>
          </div>
          <div className="crud-toolbar">
            <div className="listado-busqueda">
              <label htmlFor="buscar-clase">Buscar clase</label>
              <input id="buscar-clase" type="search" placeholder="Clase, instructor o día" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <button type="button" className="crud-primary" onClick={nueva}>Nueva clase</button>
          </div>
        </div>

        <div className="listado-tabla-scroll">
          <table className="listado-tabla">
            <thead>
              <tr>
                <th scope="col">Clase</th>
                <th scope="col">Instructor</th>
                <th scope="col">Día</th>
                <th scope="col">Horario</th>
                <th scope="col">Cupo</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((clase) => (
                <tr key={clase.id}>
                  <td><strong>{clase.nombre}</strong></td>
                  <td>{clase.instructor}</td>
                  <td>{clase.dia}</td>
                  <td>{clase.horario}</td>
                  <td>{clase.cupo} lugares</td>
                  <td>
                    <div className="crud-actions">
                      <button type="button" className="crud-secondary" onClick={() => editar(clase)}>Editar</button>
                      <button type="button" className="crud-danger" onClick={() => eliminar(clase)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td className="sin-resultados" colSpan="6">No hay clases que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="sample-note">Los cambios son locales: al recargar la página vuelven los datos de ejemplo.</p>
    </>
  )
}

export default Clases
