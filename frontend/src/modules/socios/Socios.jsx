import { useState } from 'react'
import './Socios.css'
import '../../styles/Crud.css'

// Datos iniciales de ejemplo. Las fechas se guardan como AAAA-MM-DD para el input.
const sociosIniciales = [
  { id: 1, nombre: 'Ana', apellido: 'Pérez', dni: '40123456', email: 'ana.perez@ejemplo.com', telefono: '11 4567-8901', plan: 'Plan Full', ingreso: '2026-10-05', activo: true },
  { id: 2, nombre: 'Juan', apellido: 'Gómez', dni: '38987654', email: 'juan.gomez@ejemplo.com', telefono: '11 4321-7654', plan: 'Plan Básico', ingreso: '2026-09-12', activo: true },
  { id: 3, nombre: 'Lucía', apellido: 'Fernández', dni: '42555111', email: 'lucia.fernandez@ejemplo.com', telefono: '11 5123-7788', plan: 'Plan Full', ingreso: '2026-08-20', activo: true },
  { id: 4, nombre: 'Martín', apellido: 'Rodríguez', dni: '36777888', email: 'martin.rodriguez@ejemplo.com', telefono: '11 3987-6543', plan: 'Sin plan', ingreso: '2026-07-03', activo: false },
  { id: 5, nombre: 'Sofía', apellido: 'López', dni: '44777123', email: 'sofia.lopez@ejemplo.com', telefono: '11 6234-1122', plan: 'Plan Básico', ingreso: '2026-10-14', activo: true },
  { id: 6, nombre: 'Diego', apellido: 'Martínez', dni: '35999123', email: 'diego.martinez@ejemplo.com', telefono: '11 4888-2200', plan: 'Plan Full', ingreso: '2026-06-18', activo: false },
]

function mostrarFecha(fecha) {
  if (!fecha) return '—'
  const [año, mes, dia] = fecha.split('-')
  return dia + '/' + mes + '/' + año
}

function Socios() {
  // lista contiene los socios que se ven. Los cambios viven solo en memoria.
  const [lista, setLista] = useState(sociosIniciales)
  const [siguienteId, setSiguienteId] = useState(sociosIniciales.length + 1)
  const [busqueda, setBusqueda] = useState('')
  // formulario === null significa que el formulario está cerrado.
  const [formulario, setFormulario] = useState(null)

  const texto = busqueda.trim().toLowerCase()
  const visibles = lista.filter((socio) => {
    const datos = (socio.nombre + ' ' + socio.apellido + ' ' + socio.dni + ' ' + socio.email).toLowerCase()
    return datos.includes(texto)
  })
  const activos = lista.filter((socio) => socio.activo).length

  function nuevo() {
    // id null indica que todavía no existe en la lista.
    setFormulario({ id: null, nombre: '', apellido: '', dni: '', email: '', telefono: '', nacimiento: '', plan: '', ingreso: '', activo: true })
  }

  function editar(socio) {
    // Copiamos sus datos para que la tabla no cambie hasta tocar Guardar.
    setFormulario({ ...socio })
  }

  function cambiar(campo, valor) {
    // [campo] permite actualizar el input que se modificó.
    setFormulario({ ...formulario, [campo]: valor })
  }

  function guardar(evento) {
    evento.preventDefault()
    const datos = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      dni: formulario.dni.trim(),
      email: formulario.email.trim(),
      telefono: formulario.telefono.trim(),
      plan: formulario.plan.trim() || 'Sin plan',
    }

    if (formulario.id === null) {
      setLista([...lista, { ...datos, id: siguienteId }])
      setSiguienteId(siguienteId + 1)
    } else {
      setLista(lista.map((socio) => socio.id === formulario.id ? datos : socio))
    }
    setFormulario(null)
    setBusqueda('')
  }

  function eliminar(socio) {
    if (!window.confirm('¿Eliminar a ' + socio.nombre + ' ' + socio.apellido + '?')) return
    setLista(lista.filter((item) => item.id !== socio.id))
    if (formulario?.id === socio.id) setFormulario(null)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión · Datos de ejemplo</p>
          <h1>Socios</h1>
          <p className="subtitle">Listado y datos de contacto de los socios del gimnasio.</p>
        </div>
        <div className="user-badge"><span>R</span> Recepción</div>
      </header>

      <section className="socios-resumen" aria-label="Resumen de socios">
        <div className="resumen-card"><span>Total de socios</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Activos</span><strong>{activos}</strong></div>
        <div className="resumen-card"><span>Inactivos</span><strong>{lista.length - activos}</strong></div>
      </section>

      {/* El mismo formulario sirve para crear y editar. */}
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de socio">
          <h2>{formulario.id === null ? 'Nuevo socio' : 'Editar socio'}</h2>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Nombre
                <input required value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
              </label>
              <label>Apellido
                <input required value={formulario.apellido} onChange={(e) => cambiar('apellido', e.target.value)} />
              </label>
              <label>DNI
                <input required value={formulario.dni} onChange={(e) => cambiar('dni', e.target.value)} />
              </label>
              <label>Correo
                <input type="email" required value={formulario.email} onChange={(e) => cambiar('email', e.target.value)} />
              </label>
              <label>Teléfono
                <input value={formulario.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
              </label>
              <label>Fecha de nacimiento
                <input type="date" value={formulario.nacimiento || ''} onChange={(e) => cambiar('nacimiento', e.target.value)} />
              </label>
              <label>Plan
                <input placeholder="Ej.: Plan Full" value={formulario.plan} onChange={(e) => cambiar('plan', e.target.value)} />
              </label>
              <label>Fecha de ingreso
                <input type="date" value={formulario.ingreso} onChange={(e) => cambiar('ingreso', e.target.value)} />
              </label>
              <label>Estado
                <select value={String(formulario.activo)} onChange={(e) => cambiar('activo', e.target.value === 'true')}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => setFormulario(null)}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar socio</button>
            </div>
          </form>
        </section>
      )}

      <section className="socios-panel" aria-label="Listado de socios">
        <div className="socios-panel-header">
          <div>
            <h2>Listado de socios</h2>
            <p>Mostrando {visibles.length} de {lista.length} socios</p>
          </div>
          <div className="crud-toolbar">
            <div className="socios-busqueda">
              <label htmlFor="buscar-socio">Buscar socio</label>
              <input id="buscar-socio" type="search" placeholder="Nombre, DNI o correo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <button type="button" className="crud-primary" onClick={nuevo}>Nuevo socio</button>
          </div>
        </div>

        <div className="socios-tabla-scroll">
          <table className="socios-tabla">
            <thead>
              <tr>
                <th scope="col">Socio</th>
                <th scope="col">DNI</th>
                <th scope="col">Contacto</th>
                <th scope="col">Plan</th>
                <th scope="col">Ingreso</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((socio) => (
                <tr key={socio.id}>
                  <td>
                    <div className="socio-nombre">
                      <span className="socio-avatar">{socio.nombre[0]}{socio.apellido[0]}</span>
                      <strong>{socio.nombre} {socio.apellido}</strong>
                    </div>
                  </td>
                  <td>{socio.dni}</td>
                  <td><span className="contacto-email">{socio.email}</span><small>{socio.telefono}</small></td>
                  <td>{socio.plan}</td>
                  <td>{mostrarFecha(socio.ingreso)}</td>
                  <td><span className={'estado-socio ' + (socio.activo ? 'activo' : 'inactivo')}>{socio.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="crud-actions">
                      <button type="button" className="crud-secondary" onClick={() => editar(socio)}>Editar</button>
                      <button type="button" className="crud-danger" onClick={() => eliminar(socio)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td className="sin-resultados" colSpan="7">No hay socios que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="sample-note">Los cambios son locales: al recargar la página vuelven los datos de ejemplo.</p>
    </>
  )
}

export default Socios
