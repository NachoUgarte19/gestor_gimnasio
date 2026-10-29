import { useState } from 'react'
import '../../styles/Listados.css'

// Pagos de ejemplo. Cada uno tiene socio, monto, fecha y método.
const pagos = [
  { id: 1, socio: 'Ana Pérez', monto: 35000, fecha: '20/10/2026', metodo: 'Transferencia' },
  { id: 2, socio: 'Juan Gómez', monto: 20000, fecha: '19/10/2026', metodo: 'Efectivo' },
  { id: 3, socio: 'Lucía Fernández', monto: 35000, fecha: '18/10/2026', metodo: 'Tarjeta' },
  { id: 4, socio: 'Sofía López', monto: 20000, fecha: '17/10/2026', metodo: 'Transferencia' },
  { id: 5, socio: 'Martín Rodríguez', monto: 28000, fecha: '15/10/2026', metodo: 'Efectivo' },
]

function mostrarPesos(numero) {
  return '$' + numero.toLocaleString('es-AR')
}

function Pagos() {
  // React guarda lo escrito para volver a dibujar la tabla filtrada.
  const [busqueda, setBusqueda] = useState('')
  const texto = busqueda.trim().toLowerCase()

  // Filtramos por nombre del socio o método de pago.
  const visibles = pagos.filter((pago) => {
    const datos = (pago.socio + ' ' + pago.metodo).toLowerCase()
    return datos.includes(texto)
  })

  // Sumamos los montos para mostrar un total del ejemplo.
  let total = 0
  for (const pago of pagos) total += pago.monto
  const transferencias = pagos.filter((pago) => pago.metodo === 'Transferencia').length

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión · Vista de ejemplo</p>
          <h1>Pagos</h1>
          <p className="subtitle">Registro de pagos realizados por los socios.</p>
        </div>
        <div className="user-badge"><span>R</span> Recepción</div>
      </header>

      <section className="listado-resumen" aria-label="Resumen de pagos">
        <div className="resumen-card"><span>Pagos registrados</span><strong>{pagos.length}</strong></div>
        <div className="resumen-card"><span>Monto total</span><strong>{mostrarPesos(total)}</strong></div>
        <div className="resumen-card"><span>Transferencias</span><strong>{transferencias}</strong></div>
      </section>

      <section className="listado-panel" aria-label="Listado de pagos">
        <div className="listado-panel-header">
          <div>
            <h2>Listado de pagos</h2>
            <p>Mostrando {visibles.length} de {pagos.length} pagos</p>
          </div>
          <div className="listado-busqueda">
            <label htmlFor="buscar-pago">Buscar pago</label>
            <input
              id="buscar-pago"
              type="search"
              placeholder="Socio o método"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
        </div>

        <div className="listado-tabla-scroll">
          <table className="listado-tabla">
            <thead>
              <tr>
                <th scope="col">N.º</th>
                <th scope="col">Socio</th>
                <th scope="col">Fecha</th>
                <th scope="col">Método</th>
                <th scope="col">Monto</th>
              </tr>
            </thead>
            <tbody>
              {/* map crea una fila por cada pago que pasó el filtro. */}
              {visibles.map((pago) => (
                <tr key={pago.id}>
                  <td>#{pago.id}</td>
                  <td><strong>{pago.socio}</strong></td>
                  <td>{pago.fecha}</td>
                  <td>{pago.metodo}</td>
                  <td>{mostrarPesos(pago.monto)}</td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td className="sin-resultados" colSpan="5">No hay pagos que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="sample-note">Los pagos y montos son datos de ejemplo.</p>
    </>
  )
}

export default Pagos
