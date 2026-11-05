import { useState } from 'react'
import Encabezado from '../../components/Encabezado.jsx'
import Mensaje from '../../components/Mensaje.jsx'
import { fechaTexto, mostrarFecha } from '../../utils/fechas.js'
import { mostrarPesos, nombreSocio, normalizar, siguienteId } from '../../utils/listas.js'
import { metodosPago, validarPago } from '../../utils/validaciones.js'
import '../../styles/Listados.css'
import '../../styles/Crud.css'

// La lista llega por props desde App; los estados locales controlan filtros, borrador y mensajes.
function Pagos({ lista, setLista, socios }) {
  const [busqueda, setBusqueda] = useState('')
  const [metodo, setMetodo] = useState('')
  // null significa formulario cerrado; un objeto representa el borrador abierto.
  const [formulario, setFormulario] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  // Este resultado se recalcula al cambiar datos o filtros; no modifica la lista original.
  const visibles = lista.filter((pago) =>
    normalizar(nombreSocio(socios, pago.socioId) + ' ' + pago.metodoPago).includes(normalizar(busqueda)) && (!metodo || pago.metodoPago === metodo)
  ).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
  // Las tarjetas resumen los resultados filtrados, no una cifra fija.
  const total = visibles.reduce((suma, pago) => suma + pago.monto, 0)

  // Con un registro copia el pago para editar; sin argumento prepara un alta con valores iniciales.
  function abrir(pago) {
    setFormulario(pago ? { ...pago } : { id: null, socioId: '', monto: '', fecha: fechaTexto(), metodoPago: 'Efectivo' })
    setError('')
    setMensaje('')
  }

  // Actualiza un solo campo del borrador y retira el error anterior para permitir corregirlo.
  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
    setError('')
  }

  // Prepara y valida el pago. setLista comunica la nueva lista al padre y actualiza las otras pantallas.
  function guardar(evento) {
    evento.preventDefault()
    const datos = { ...formulario, monto: Number(formulario.monto) }
    const fallo = validarPago(datos, socios)
    if (fallo) return setError(fallo)
    if (datos.id === null) setLista([...lista, { ...datos, id: siguienteId(lista) }])
    else setLista(lista.map((pago) => pago.id === datos.id ? datos : pago))
    setMensaje(datos.id === null ? 'Pago registrado correctamente.' : 'Pago actualizado correctamente.')
    setFormulario(null)
    setBusqueda('')
    setMetodo('')
  }

  // Revisa las condiciones y pide confirmacion antes de quitar el registro de la lista compartida.
  function eliminar(pago) {
    if (!window.confirm('¿Eliminar el pago de ' + mostrarPesos(pago.monto) + ' de ' + nombreSocio(socios, pago.socioId) + '?')) return
    setLista(lista.filter((item) => item.id !== pago.id))
    if (formulario?.id === pago.id) setFormulario(null)
    setError('')
    setMensaje('Pago eliminado.')
  }

  return (
    <>
      <Encabezado titulo="Pagos" descripcion="Registrá y consultá los pagos de las cuotas de los socios." />
      <section className="listado-resumen" aria-label="Resumen de pagos filtrados">
        <div className="resumen-card"><span>Pagos encontrados</span><strong>{visibles.length}</strong></div>
        <div className="resumen-card"><span>Monto de los resultados</span><strong>{mostrarPesos(total)}</strong></div>
        <div className="resumen-card"><span>Transferencias encontradas</span><strong>{visibles.filter((pago) => pago.metodoPago === 'Transferencia').length}</strong></div>
      </section>
      <Mensaje texto={mensaje} /><Mensaje texto={error} error />
      {socios.length === 0 && <p className="empty-state">Primero agregá un socio desde Socios para poder registrar un pago.</p>}
      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de pago">
          <h2>{formulario.id === null ? 'Nuevo pago' : 'Editar pago'}</h2>
          <p className="form-help">Todos los campos son obligatorios. También podés registrar pagos de socios inactivos.</p>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Socio *
                <select autoFocus required value={formulario.socioId} onChange={(e) => cambiar('socioId', e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Elegir socio</option>
                  {socios.map((socio) => <option key={socio.id} value={socio.id}>{socio.nombre} {socio.apellido} · DNI {socio.dni}</option>)}
                </select>
              </label>
              <label>Monto *<input type="number" min="0.01" step="0.01" required value={formulario.monto} onChange={(e) => cambiar('monto', e.target.value)} /></label>
              <label>Fecha de pago *<input type="date" required max={fechaTexto()} value={formulario.fecha} onInput={(e) => cambiar('fecha', e.target.value)} /></label>
              <label>Método de pago *<select value={formulario.metodoPago} onChange={(e) => cambiar('metodoPago', e.target.value)}>{metodosPago.map((nombre) => <option key={nombre}>{nombre}</option>)}</select></label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => { setFormulario(null); setError(''); setMensaje('Edición cancelada. No se guardaron cambios.') }}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar pago</button>
            </div>
          </form>
        </section>
      )}
      <section className="listado-panel" aria-label="Listado de pagos">
        <div className="listado-panel-header">
          <div><h2>Listado de pagos</h2><p>Mostrando {visibles.length} de {lista.length} pagos</p></div>
          <div className="crud-toolbar">
            <div className="listado-busqueda"><label htmlFor="buscar-pago">Buscar pago</label><input id="buscar-pago" type="search" placeholder="Socio o método" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
            <div className="listado-filtro"><label htmlFor="metodo-pago">Método</label><select id="metodo-pago" value={metodo} onChange={(e) => setMetodo(e.target.value)}><option value="">Todos</option>{metodosPago.map((nombre) => <option key={nombre}>{nombre}</option>)}</select></div>
            <button type="button" className="crud-primary" disabled={socios.length === 0} onClick={() => abrir()}>Nuevo pago</button>
          </div>
        </div>
        <p className="table-hint">En pantallas pequeñas, desplazá la tabla hacia los lados para ver todas las columnas y acciones.</p>
        <div className="listado-tabla-scroll" role="region" aria-label="Tabla de pagos, desplazamiento horizontal" tabIndex="0">
          <table className="listado-tabla">
            <caption className="sr-only">Historial de pagos de cuotas</caption>
            <thead><tr>{['N.º', 'Socio', 'Fecha', 'Método', 'Monto', 'Acciones'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
            <tbody>
              {visibles.map((pago) => (
                <tr key={pago.id}>
                  <td>#{pago.id}</td><td><strong>{nombreSocio(socios, pago.socioId)}</strong></td><td>{mostrarFecha(pago.fecha)}</td><td>{pago.metodoPago}</td><td>{mostrarPesos(pago.monto)}</td>
                  <td><div className="crud-actions">
                    <button type="button" className="crud-secondary" aria-label={'Editar pago ' + pago.id} onClick={() => abrir(pago)}>Editar</button>
                    <button type="button" className="crud-danger" aria-label={'Eliminar pago ' + pago.id} onClick={() => eliminar(pago)}>Eliminar</button>
                  </div></td>
                </tr>
              ))}
              {visibles.length === 0 && <tr><td className="sin-resultados" colSpan="6">{lista.length ? 'No hay pagos que coincidan con los filtros.' : 'Todavía no hay pagos. Registrá el primero con Nuevo pago.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default Pagos
