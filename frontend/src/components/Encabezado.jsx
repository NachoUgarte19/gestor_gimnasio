export default function Encabezado({ titulo, descripcion }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Administración</p>
        <h1>{titulo}</h1>
        <p className="subtitle">{descripcion}</p>
      </div>
      <div className="user-badge"><span aria-hidden="true">A</span> Administrador</div>
    </header>
  )
}
