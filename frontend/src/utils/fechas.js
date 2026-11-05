// Usamos fechas locales para que la zona horaria no cambie el día.
export const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Convierte una fecha local en AAAA-MM-DD para guardar y usar en los campos de fecha.
export function fechaTexto(fecha = new Date()) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

// Separa anio, mes y dia. En Date los meses empiezan en cero, por eso se resta uno.
export function leerFecha(texto) {
  const [año, mes, dia] = texto.split('-').map(Number)
  return new Date(año, mes - 1, dia)
}

// Crea otra fecha sin cambiar la original; Date resuelve los cambios de mes y anio.
export function sumarDias(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + cantidad)
}

// Calcula cuantos dias retroceder hasta el lunes de la misma semana.
export function inicioSemana(fecha) {
  return sumarDias(fecha, -((fecha.getDay() + 6) % 7))
}

// Convierte la fecha de asistencia en el nombre semanal que utilizan las clases.
export function diaDeFecha(texto) {
  return diasSemana[(leerFecha(texto).getDay() + 6) % 7]
}

// Da formato argentino a la fecha; el guion indica que el dato opcional no fue informado.
export function mostrarFecha(texto) {
  if (!texto) return '—'
  return leerFecha(texto).toLocaleDateString('es-AR')
}
