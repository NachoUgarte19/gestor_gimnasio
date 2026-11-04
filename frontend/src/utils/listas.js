// Funciones pequeñas que se repiten en varios módulos.
export function siguienteId(lista) {
  return Math.max(0, ...lista.map((item) => item.id)) + 1
}

export function normalizar(texto) {
  return texto.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function mostrarPesos(numero) {
  return numero.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function nombreSocio(socios, id) {
  const socio = socios.find((item) => item.id === id)
  return socio ? `${socio.nombre} ${socio.apellido}` : 'Socio no disponible'
}
