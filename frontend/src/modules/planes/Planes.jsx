import { useState } from 'react'
import '../../styles/Listados.css'
import '../../styles/Crud.css'

// Datos iniciales de ejemplo. Todavía no se consultan planes reales.
const planesIniciales = [
  { id: 1, nombre: 'Plan Básico', precio: 20000, beneficios: 'Acceso al gimnasio y clases grupales' },
  { id: 2, nombre: 'Plan Plus', precio: 28000, beneficios: 'Clases grupales y seguimiento mensual' },
  { id: 3, nombre: 'Plan Full', precio: 35000, beneficios: 'Clases grupales y asesoramiento personalizado' },
]

function mostrarPesos(numero) {
  return '$' + numero.toLocaleString('es-AR')
}

function Planes() {
  const [lista, setLista] = useState(planesIniciales)
  const [siguienteId, setSiguienteId] = useState(planesIniciales.length + 1)
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState(null)

  const texto = busqueda.trim().toLowerCase()
  const visibles = lista.filter((plan) => {
    const datos = (plan.nombre + ' ' + plan.beneficios).toLowerCase()
    return datos.includes(texto)
  })

  // Buscamos los precios extremos. Si se eliminan todos, mostramos un guion.
  let menor = lista.length > 0 ? lista[0].precio : 0
  let mayor = menor
  for (const plan of lista) {
    if (plan.precio < menor) menor = plan.precio
    if (plan.precio > mayor) mayor = plan.precio
  }

  function nuevo() {
    setFormulario({ id: null, nombre: '', precio: '', beneficios: '' })
  }

  function editar(plan) {
    setFormulario({ ...plan })
  }

  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
  }

  function guardar(evento) {
    evento.preventDefault()
    // Los inputs numéricos entregan texto; convertimos precio a número.
    const datos = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      precio: Number(formulario.precio),
      beneficios: formulario.beneficios.trim(),
    }
    if (formulario.id === null) {
      setLista([...lista, { ...datos, id: siguienteId }])
      setSiguienteId(siguienteId + 1)
    } else {
      setLista(lista.map((plan) => plan.id === formulario.id ? datos : plan))
    }
    setFormulario(null)
    setBusqueda('')
  }

  function eliminar(plan) {
    if (!window.confirm('¿Eliminar el plan ' + plan.nombre + '?')) return
    setLista(lista.filter((item) => item.id !== plan.id))
    if (formulario?.id === plan.id) setFormulario(null)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión · Datos de ejemplo</p>
          <h1>Planes</h1>
          <p className="subtitle">Opciones y precios de los planes del gimnasio.</p>
        </div>
        <div className="user-badge"><span>R</span> Recepción</div>
      </header>

      <section className="listado-resumen" aria-label="Resumen de planes">
        <div className="resumen-card"><span>Planes disponibles</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Precio desde</span><strong>{lista.length ? mostrarPesos(menor) : '—'}</strong></div>
        <div className="resumen-card"><span>Precio hasta</span><strong>{lista.length ? mostrarPesos(mayor) : '—'}</strong></div>
      </section>

      {/* El formulario se abre al tocar Nuevo o Editar. */}
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de plan">
          <h2>{formulario.id === null ? 'Nuevo plan' : 'Editar plan'}</h2>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Nombre
                <input required value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
              </label>
              <label>Precio
                <input type="number" min="0.01" step="0.01" required value={formulario.precio} onChange={(e) => cambiar('precio', e.target.value)} />
              </label>
              <label className="crud-wide">Beneficios
                <textarea rows="3" value={formulario.beneficios} onChange={(e) => cambiar('beneficios', e.target.value)} />
              </label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => setFormulario(null)}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar plan</button>
            </div>
          </form>
        </section>
      )}

      <section className="listado-panel" aria-label="Listado de planes">
        <div className="listado-panel-header">
          <div>
            <h2>Listado de planes</h2>
            <p>Mostrando {visibles.length} de {lista.length} planes</p>
          </div>
          <div className="crud-toolbar">
            <div className="listado-busqueda">
              <label htmlFor="buscar-plan">Buscar plan</label>
              <input id="buscar-plan" type="search" placeholder="Nombre o beneficio" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <button type="button" className="crud-primary" onClick={nuevo}>Nuevo plan</button>
          </div>
        </div>

        <div className="listado-tabla-scroll">
          <table className="listado-tabla">
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col">Precio</th>
                <th scope="col">Beneficios</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((plan) => (
                <tr key={plan.id}>
                  <td><strong>{plan.nombre}</strong></td>
                  <td>{mostrarPesos(plan.precio)}</td>
                  <td>{plan.beneficios || '—'}</td>
                  <td>
                    <div className="crud-actions">
                      <button type="button" className="crud-secondary" onClick={() => editar(plan)}>Editar</button>
                      <button type="button" className="crud-danger" onClick={() => eliminar(plan)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td className="sin-resultados" colSpan="4">No hay planes que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="sample-note">Los cambios son locales: al recargar la página vuelven los datos de ejemplo.</p>
    </>
  )
}

export default Planes
