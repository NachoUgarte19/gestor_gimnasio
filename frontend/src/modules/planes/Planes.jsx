import { useState } from 'react'
import Encabezado from '../../components/Encabezado.jsx'
import Mensaje from '../../components/Mensaje.jsx'
import { mostrarPesos, normalizar, siguienteId } from '../../utils/listas.js'
import { validarPlan } from '../../utils/validaciones.js'
import '../../styles/Listados.css'
import '../../styles/Crud.css'

// La lista llega por props desde App; los estados locales controlan filtros, borrador y mensajes.
function Planes({ lista, setLista, socios }) {
  const [busqueda, setBusqueda] = useState('')
  // null significa formulario cerrado; un objeto representa el borrador abierto.
  const [formulario, setFormulario] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  // Este resultado se recalcula al cambiar datos o filtros; no modifica la lista original.
  const visibles = lista.filter((plan) => normalizar(plan.nombre + ' ' + plan.beneficios).includes(normalizar(busqueda)))
  const precios = lista.map((plan) => plan.precio)

  // Con un registro copia el plan para editar; sin argumento prepara un alta con valores iniciales.
  function abrir(plan) {
    setFormulario(plan ? { ...plan } : { id: null, nombre: '', precio: '', beneficios: '' })
    setError('')
    setMensaje('')
  }

  // Actualiza un solo campo del borrador y retira el error anterior para permitir corregirlo.
  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
    setError('')
  }

  // Prepara y valida el plan. setLista comunica la nueva lista al padre y actualiza las otras pantallas.
  function guardar(evento) {
    evento.preventDefault()
    // Los inputs numéricos entregan texto: lo convertimos antes de guardar.
    const datos = { ...formulario, nombre: formulario.nombre.trim(), precio: Number(formulario.precio), beneficios: formulario.beneficios.trim() }
    const fallo = validarPlan(datos)
    if (fallo) return setError(fallo)
    if (datos.id === null) setLista([...lista, { ...datos, id: siguienteId(lista) }])
    else setLista(lista.map((plan) => plan.id === datos.id ? datos : plan))
    setMensaje(datos.id === null ? 'Plan creado correctamente.' : 'Plan actualizado. Los socios asignados verán el cambio.')
    setFormulario(null)
    setBusqueda('')
  }

  // Revisa las condiciones y pide confirmacion antes de quitar el registro de la lista compartida.
  function eliminar(plan) {
    // Evitamos que queden socios apuntando a un plan que ya no existe.
    if (socios.some((socio) => socio.planId === plan.id)) {
      setMensaje('')
      return setError('Este plan tiene socios asignados. Cambiales el plan desde Socios antes de eliminarlo.')
    }
    if (!window.confirm('¿Eliminar el plan ' + plan.nombre + '?')) return
    setLista(lista.filter((item) => item.id !== plan.id))
    if (formulario?.id === plan.id) setFormulario(null)
    setError('')
    setMensaje('Plan eliminado.')
  }

  return (
    <>
      <Encabezado titulo="Planes" descripcion="Definí las opciones, precios y beneficios del gimnasio." />
      <section className="listado-resumen" aria-label="Resumen de planes">
        <div className="resumen-card"><span>Planes disponibles</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Precio desde</span><strong>{lista.length ? mostrarPesos(Math.min(...precios)) : '—'}</strong></div>
        <div className="resumen-card"><span>Precio hasta</span><strong>{lista.length ? mostrarPesos(Math.max(...precios)) : '—'}</strong></div>
      </section>
      <Mensaje texto={mensaje} /><Mensaje texto={error} error />
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de plan">
          <h2>{formulario.id === null ? 'Nuevo plan' : 'Editar plan'}</h2>
          <p className="form-help">Los campos marcados con * son obligatorios. Los planes no limitan las clases que puede reservar un socio.</p>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Nombre *<input autoFocus required maxLength="100" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} /></label>
              <label>Precio mensual *<input type="number" min="0.01" step="0.01" required value={formulario.precio} onChange={(e) => cambiar('precio', e.target.value)} /></label>
              <label className="crud-wide">Beneficios<textarea rows="3" maxLength="500" value={formulario.beneficios} onChange={(e) => cambiar('beneficios', e.target.value)} /><small>{formulario.beneficios.length}/500 caracteres</small></label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => { setFormulario(null); setError(''); setMensaje('Edición cancelada. No se guardaron cambios.') }}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar plan</button>
            </div>
          </form>
        </section>
      )}
      <section className="listado-panel" aria-label="Listado de planes">
        <div className="listado-panel-header">
          <div><h2>Listado de planes</h2><p>Mostrando {visibles.length} de {lista.length} planes</p></div>
          <div className="crud-toolbar">
            <div className="listado-busqueda"><label htmlFor="buscar-plan">Buscar plan</label><input id="buscar-plan" type="search" placeholder="Nombre o beneficio" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
            <button type="button" className="crud-primary" onClick={() => abrir()}>Nuevo plan</button>
          </div>
        </div>
        <p className="table-hint">En pantallas pequeñas, desplazá la tabla hacia los lados para ver todas las columnas y acciones.</p>
        <div className="listado-tabla-scroll" role="region" aria-label="Tabla de planes, desplazamiento horizontal" tabIndex="0">
          <table className="listado-tabla">
            <caption className="sr-only">Planes y precios mensuales</caption>
            <thead><tr>{['Plan', 'Precio mensual', 'Beneficios', 'Socios', 'Acciones'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
            <tbody>
              {visibles.map((plan) => (
                <tr key={plan.id}>
                  <td><strong>{plan.nombre}</strong></td><td>{mostrarPesos(plan.precio)}</td><td className="texto-largo">{plan.beneficios || 'Sin beneficios detallados'}</td>
                  <td>{socios.filter((socio) => socio.planId === plan.id).length}</td>
                  <td><div className="crud-actions">
                    <button type="button" className="crud-secondary" aria-label={'Editar ' + plan.nombre} onClick={() => abrir(plan)}>Editar</button>
                    <button type="button" className="crud-danger" aria-label={'Eliminar ' + plan.nombre} onClick={() => eliminar(plan)}>Eliminar</button>
                  </div></td>
                </tr>
              ))}
              {visibles.length === 0 && <tr><td className="sin-resultados" colSpan="5">{lista.length ? 'No hay planes que coincidan con la búsqueda.' : 'Todavía no hay planes. Creá el primero con Nuevo plan.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default Planes
