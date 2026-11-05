import { useState } from 'react'
import { fechaTexto, mostrarFecha } from '../../../utils/fechas.js'
import { mostrarPesos } from '../../../utils/listas.js'
import { prepararPerfil } from '../clienteUtils.js'

// Muestra datos de la cuenta, plan y pagos propios. formulario contiene un borrador hasta presionar Guardar.
function PerfilCliente({ socio, planes, pagos, onGuardar, onMensaje, onPrivacidad }) {
  // null significa formulario cerrado; un objeto representa el borrador abierto.
  const [formulario, setFormulario] = useState(null)
  const [verPagos, setVerPagos] = useState(false)
  const plan = planes.find((item) => item.id === socio.planId)
  // Solo se muestran pagos de esta cuenta, ordenados del mas reciente al mas antiguo.
  const propios = pagos.filter((pago) => pago.socioId === socio.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
  const ultimo = propios[0]

  // Copia el borrador y reemplaza el campo indicado; todavia no modifica el registro compartido.
  function cambiar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor })
  }

  // Evita recargar la pagina, prepara los campos editables y cierra el formulario si el padre acepta los datos.
  function guardar(evento) {
    evento.preventDefault()
    if (onGuardar(prepararPerfil(socio, formulario))) setFormulario(null)
  }

  return (
    <>
      <header className="client-page-header">
        <p className="eyebrow">Mi cuenta</p>
        <h1>Mi perfil</h1>
        <p>Consultá tu plan y mantené tus datos actualizados.</p>
      </header>
      <section className="client-profile-head" aria-label="Titular de la cuenta">
        <span className="client-avatar" aria-hidden="true">{socio.nombre[0]}{socio.apellido[0]}</span>
        <div><h2>{socio.nombre} {socio.apellido}</h2><p>{socio.email}</p></div>
      </section>

      <section className="client-plan" aria-label="Mi plan y estado de cuenta">
        <p className="eyebrow">Mi plan</p>
        <h2>{plan?.nombre || 'Sin plan asignado'}</h2>
        {plan && <><p className="client-plan-price">{mostrarPesos(plan.precio)} <span>por mes</span></p><p>{plan.beneficios || 'Sin beneficios detallados.'}</p></>}
        <span className={'client-pill' + (socio.activo ? '' : ' client-pill-muted')}>{socio.activo ? 'Socio activo' : 'Socio inactivo'}</span>
        <p className="client-card-note">Para cambiar tu plan o consultar el estado de tu cuenta, comunicate con recepción. Cualquier socio activo puede reservar clases.</p>
      </section>

      <section className="client-profile-section" aria-label="Mis datos personales">
        <div className="client-section-row">
          <h2>Datos personales</h2>
          {!formulario && <button type="button" className="crud-secondary" onClick={() => { setFormulario({ ...socio }); onMensaje('') }}>Editar mis datos</button>}
        </div>
        {formulario ? (
          <form className="client-profile-form" onSubmit={guardar}>
            <p className="form-help">Los campos con * son obligatorios. El DNI, el plan y el estado los administra recepción.</p>
            <div className="crud-form-grid">
              <label>Nombre *
                <input autoFocus required maxLength="100" autoComplete="given-name" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
              </label>
              <label>Apellido *
                <input required maxLength="100" autoComplete="family-name" value={formulario.apellido} onChange={(e) => cambiar('apellido', e.target.value)} />
              </label>
              <label>Correo *
                <input required type="email" maxLength="150" autoComplete="email" value={formulario.email} onChange={(e) => cambiar('email', e.target.value)} />
              </label>
              <label>Teléfono
                <input type="tel" maxLength="30" autoComplete="tel" value={formulario.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
              </label>
              <label>Fecha de nacimiento
                <input type="date" max={fechaTexto()} value={formulario.fechaNacimiento} onInput={(e) => cambiar('fechaNacimiento', e.target.value)} />
              </label>
            </div>
            <div className="crud-form-buttons">
              <button type="button" className="crud-secondary" onClick={() => { setFormulario(null); onMensaje('Edición cancelada. No se guardaron cambios.') }}>Cancelar edición</button>
              <button type="submit" className="crud-primary">Guardar mis datos</button>
            </div>
          </form>
        ) : (
          <dl className="client-details">
            <div><dt>Nombre</dt><dd>{socio.nombre} {socio.apellido}</dd></div>
            <div><dt>DNI</dt><dd>{socio.dni}</dd></div>
            <div><dt>Correo</dt><dd>{socio.email}</dd></div>
            <div><dt>Teléfono</dt><dd>{socio.telefono || 'Sin teléfono registrado'}</dd></div>
            <div><dt>Fecha de nacimiento</dt><dd>{mostrarFecha(socio.fechaNacimiento)}</dd></div>
            <div><dt>Socio desde</dt><dd>{mostrarFecha(socio.fechaIngreso)}</dd></div>
          </dl>
        )}
      </section>

      <section className="client-profile-section" aria-label="Mis pagos">
        <div className="client-section-row"><h2>Pagos</h2><button type="button" className="client-text-button" aria-expanded={verPagos} aria-controls="pagos-del-cliente" onClick={() => setVerPagos(!verPagos)}>{verPagos ? 'Ocultar historial de pagos' : 'Ver historial de pagos'}</button></div>
        {ultimo ? <p>Último pago: <strong>{mostrarFecha(ultimo.fecha)} · {mostrarPesos(ultimo.monto)}</strong></p> : <p>Todavía no tenés pagos registrados.</p>}
        {verPagos && <div id="pagos-del-cliente" className="client-payments">
          {propios.map((pago) => <article key={pago.id} className="client-payment">
            <h3>Pago #{pago.id}</h3>
            <dl className="client-details">
              <div><dt>Fecha</dt><dd>{mostrarFecha(pago.fecha)}</dd></div>
              <div><dt>Monto</dt><dd>{mostrarPesos(pago.monto)}</dd></div>
              <div><dt>Método</dt><dd>{pago.metodoPago}</dd></div>
            </dl>
          </article>)}
          {propios.length === 0 && <p className="empty-state">Cuando recepción registre un pago, lo vas a ver acá.</p>}
        </div>}
      </section>

      <button type="button" className="client-text-button" onClick={onPrivacidad}>Consultar políticas de privacidad</button>
    </>
  )
}

export default PerfilCliente
