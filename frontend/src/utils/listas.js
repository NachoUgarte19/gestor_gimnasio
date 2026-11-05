// Funciones pequeñas que se repiten en varios módulos.
// Busca el mayor id y suma uno. El cero permite comenzar en 1 cuando la lista esta vacia.
export function siguienteId(lista) {
  return Math.max(0, ...lista.map((item) => item.id)) + 1
}

// Quita espacios externos, tildes y mayusculas para hacer mas flexible la busqueda.
export function normalizar(texto) {
  return texto.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Aplica separadores y simbolo de moneda argentinos; conserva el numero original para los calculos.
export function mostrarPesos(numero) {
  return numero.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

// Relaciona socioId con el registro del socio. El texto alternativo contempla una referencia ausente.
export function nombreSocio(socios, id) {
  const socio = socios.find((item) => item.id === id)
  return socio ? `${socio.nombre} ${socio.apellido}` : 'Socio no disponible'
}
