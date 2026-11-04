// Usamos fechas locales para que la zona horaria no cambie el día.
export const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function fechaTexto(fecha = new Date()) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

export function leerFecha(texto) {
  const [año, mes, dia] = texto.split('-').map(Number)
  return new Date(año, mes - 1, dia)
}

export function sumarDias(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + cantidad)
}

export function inicioSemana(fecha) {
  return sumarDias(fecha, -((fecha.getDay() + 6) % 7))
}

export function diaDeFecha(texto) {
  return diasSemana[(leerFecha(texto).getDay() + 6) % 7]
}

export function mostrarFecha(texto) {
  if (!texto) return '—'
  return leerFecha(texto).toLocaleDateString('es-AR')
}
