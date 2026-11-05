import { useState } from 'react'
import Encabezado from '../../components/Encabezado.jsx'
import Mensaje from '../../components/Mensaje.jsx'
import { fechaTexto, mostrarFecha } from '../../utils/fechas.js'
import { normalizar, siguienteId } from '../../utils/listas.js'
import { validarSocio } from '../../utils/validaciones.js'
import './Socios.css'
import '../../styles/Crud.css'

// La lista llega por props desde App; los estados locales controlan filtros, borrador y mensajes.
function Socios({ lista, setLista, planes, reservas, pagos }) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('todos')
  // null significa formulario cerrado; un objeto representa el borrador abierto.
  const [formulario, setFormulario] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // Este resultado se recalcula al cambiar datos o filtros; no modifica la lista original.
  const visibles = lista.filter((socio) => {
    const coincide = normalizar(socio.nombre + ' ' + socio.apellido + ' ' + socio.dni + ' ' + socio.email).includes(normalizar(busqueda))
    return coincide && (estado === 'todos' || socio.activo === (estado === 'activos'))
  })
  const activos = lista.filter((socio) => socio.activo).length

  // Con un registro copia el socio para editar; sin argumento prepara un alta con valores iniciales.
  function abrir(socio) {
    // Al editar copiamos el objeto: la tabla cambia recién al guardar.
    setFormulario(socio ? { ...socio } : {
      id: null, nombre: '', apellido: '', dni: '', email: '', telefono: '',
      fechaNacimiento: '', fechaIngreso: fechaTexto(), planId: null, activo: true,
    })
    setError('')
    setMensaje('')
  }

  // Actualiza un solo campo del borrador y retira el error anterior para permitir corregirlo.
  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
    setError('')
  }

  // Prepara y valida el socio. setLista comunica la nueva lista al padre y actualiza las otras pantallas.
  function guardar(evento) {
    evento.preventDefault()
    const datos = {
      ...formulario,
      nombre: formulario.nombre.trim(), apellido: formulario.apellido.trim(),
      dni: formulario.dni.trim(), email: formulario.email.trim(), telefono: formulario.telefono.trim(),
      fechaIngreso: formulario.fechaIngreso || fechaTexto(),
    }
    const fallo = validarSocio(datos, lista, planes)
    if (fallo) return setError(fallo)

    if (datos.id === null) setLista([...lista, { ...datos, id: siguienteId(lista) }])
    else setLista(lista.map((socio) => socio.id === datos.id ? datos : socio))
    setMensaje(datos.id === null ? 'Socio creado correctamente.' : 'Datos del socio actualizados.')
    setFormulario(null)
    setBusqueda('')
    setEstado('todos')
  }

  // Revisa las condiciones y pide confirmacion antes de quitar el registro de la lista compartida.
  function eliminar(socio) {
    // Conservamos el historial: para una baja habitual se usa el estado Inactivo.
    if (reservas.some((reserva) => reserva.socioId === socio.id) || pagos.some((pago) => pago.socioId === socio.id)) {
      setMensaje('')
      return setError('Este socio tiene reservas o pagos. Podés desactivarlo desde Editar para conservar su historial.')
    }
    if (!window.confirm('¿Eliminar a ' + socio.nombre + ' ' + socio.apellido + '?')) return
    setLista(lista.filter((item) => item.id !== socio.id))
    if (formulario?.id === socio.id) setFormulario(null)
    setError('')
    setMensaje('Socio eliminado.')
  }

  return (
    <>
      <Encabezado titulo="Socios" descripcion="Administrá los datos, el plan y el estado de cada socio." />
      <section className="socios-resumen" aria-label="Resumen de socios">
        <div className="resumen-card"><span>Total de socios</span><strong>{lista.length}</strong></div>
        <div className="resumen-card"><span>Activos</span><strong>{activos}</strong></div>
        <div className="resumen-card"><span>Inactivos</span><strong>{lista.length - activos}</strong></div>
      </section>
      <Mensaje texto={mensaje} />
      <Mensaje texto={error} error />

      {formulario && (
        <section className="crud-form-panel" aria-label="Formulario de socio">
          <h2>{formulario.id === null ? 'Nuevo socio' : 'Editar socio'}</h2>
          <p className="form-help">Los campos marcados con * son obligatorios. Un socio nuevo empieza activo.</p>
          <form onSubmit={guardar}>
            <div className="crud-form-grid">
              <label>Nombre *<input autoFocus required maxLength="100" autoComplete="given-name" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} /></label>
              <label>Apellido *<input required maxLength="100" autoComplete="family-name" value={formulario.apellido} onChange={(e) => cambiar('apellido', e.target.value)} /></label>
              <label>DNI *<input required inputMode="numeric" pattern="[0-9]{6,20}" maxLength="20" title="De 6 a 20 dígitos, sin puntos" value={formulario.dni} onChange={(e) => cambiar('dni', e.target.value)} /></label>
              <label>Correo *<input required type="email" maxLength="150" autoComplete="email" value={formulario.email} onChange={(e) => cambiar('email', e.target.value)} /></label>
              <label>Teléfono<input type="tel" maxLength="30" autoComplete="tel" value={formulario.telefono} onChange={(e) => cambiar('telefono', e.target.value)} /></label>
              <label>Fecha de nacimiento<input type="date" max={fechaTexto()} value={formulario.fechaNacimiento} onInput={(e) => cambiar('fechaNacimiento', e.target.value)} /></label>
              <label>Plan
                <select value={formulario.planId ?? ''} onChange={(e) => cambiar('planId', e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Sin plan</option>
                  {planes.map((plan) => <option key={plan.id} value={plan.id}>{plan.nombre}</option>)}
                </select>
              </label>
              <label>Fecha de ingreso<input type="date" max={fechaTexto()} value={formulario.fechaIngreso} onInput={(e) => cambiar('fechaIngreso', e.target.value)} /></label>
              {formulario.id !== null && <label>Estado
                <select value={String(formulario.activo)} onChange={(e) => cambiar('activo', e.target.value === 'true')}>
                  <option value="true">Activo</option><option value="false">Inactivo</option>
                </select>
              </label>}
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => { setFormulario(null); setError(''); setMensaje('Edición cancelada. No se guardaron cambios.') }}>Cancelar</button>
              <button type="submit" className="crud-primary">Guardar socio</button>
            </div>
          </form>
        </section>
      )}

      <section className="socios-panel" aria-label="Listado de socios">
        <div className="socios-panel-header">
          <div><h2>Listado de socios</h2><p>Mostrando {visibles.length} de {lista.length} socios</p></div>
          <div className="crud-toolbar">
            <div className="socios-busqueda"><label htmlFor="buscar-socio">Buscar socio</label><input id="buscar-socio" type="search" placeholder="Nombre, DNI o correo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
            <div className="listado-filtro"><label htmlFor="estado-socio">Estado</label><select id="estado-socio" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="todos">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select></div>
            <button type="button" className="crud-primary" onClick={() => abrir()}>Nuevo socio</button>
          </div>
        </div>
        <p className="table-hint">En pantallas pequeñas, desplazá la tabla hacia los lados para ver todas las columnas y acciones.</p>
        <div className="socios-tabla-scroll" role="region" aria-label="Tabla de socios, desplazamiento horizontal" tabIndex="0">
          <table className="socios-tabla">
            <caption className="sr-only">Socios del gimnasio y sus acciones de administración</caption>
            <thead><tr>{['Socio', 'DNI', 'Contacto', 'Plan', 'Ingreso', 'Estado', 'Acciones'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
            <tbody>
              {visibles.map((socio) => (
                <tr key={socio.id}>
                  <td><div className="socio-nombre"><span className="socio-avatar" aria-hidden="true">{socio.nombre[0]}{socio.apellido[0]}</span><strong>{socio.nombre} {socio.apellido}</strong></div></td>
                  <td>{socio.dni}</td>
                  <td><span className="contacto-email">{socio.email}</span><small>{socio.telefono || 'Sin teléfono'}</small></td>
                  <td>{planes.find((plan) => plan.id === socio.planId)?.nombre || 'Sin plan'}</td>
                  <td>{mostrarFecha(socio.fechaIngreso)}</td>
                  <td><span className={'estado-socio ' + (socio.activo ? 'activo' : 'inactivo')}>{socio.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td><div className="crud-actions">
                    <button type="button" className="crud-secondary" aria-label={'Editar a ' + socio.nombre + ' ' + socio.apellido} onClick={() => abrir(socio)}>Editar</button>
                    <button type="button" className="crud-danger" aria-label={'Eliminar a ' + socio.nombre + ' ' + socio.apellido} onClick={() => eliminar(socio)}>Eliminar</button>
                  </div></td>
                </tr>
              ))}
              {visibles.length === 0 && <tr><td className="sin-resultados" colSpan="7">{lista.length ? 'No hay socios que coincidan con los filtros.' : 'Todavía no hay socios. Agregá el primero con Nuevo socio.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default Socios
