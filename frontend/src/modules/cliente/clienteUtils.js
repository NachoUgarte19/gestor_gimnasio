import { leerFecha } from '../../utils/fechas.js'
import { validarReserva } from '../../utils/validaciones.js'

export function inicioClase(clase, fecha) {
  const inicio = leerFecha(fecha)
  const [hora, minutos] = clase.horario.split(':').map(Number)
  inicio.setHours(hora, minutos, 0, 0)
  return inicio
}

export function claseComenzada(clase, fecha, ahora = new Date()) {
  return inicioClase(clase, fecha) <= ahora
}

export function lugaresDisponibles(clase, fecha, reservas) {
  const ocupados = reservas.filter((reserva) => reserva.claseId === clase.id && reserva.fecha === fecha).length
  return Math.max(0, clase.cupo - ocupados)
}

// Filtramos por el socio actual antes de ordenar; nunca mostramos reservas ajenas.
export function reservasDelSocio(reservas, clases, socioId) {
  return reservas
    .filter((reserva) => reserva.socioId === socioId)
    .map((reserva) => ({ ...reserva, clase: clases.find((clase) => clase.id === reserva.claseId) }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.clase?.horario || '').localeCompare(b.clase?.horario || ''))
}

export function validarReservaCliente(reserva, socio, clases, reservas, ahora = new Date()) {
  if (reserva.socioId !== socio.id) return 'La reserva debe pertenecer al socio seleccionado.'
  const error = validarReserva(reserva, [socio], clases, reservas)
  if (error) return error
  const clase = clases.find((item) => item.id === reserva.claseId)
  if (claseComenzada(clase, reserva.fecha, ahora)) return 'Esta clase ya comenzó. Elegí un turno futuro.'
  return ''
}

export function validarCancelacionCliente(reserva, socio, clases, ahora = new Date()) {
  if (!reserva || reserva.socioId !== socio.id) return 'No se encontró la reserva de tu cuenta.'
  const clase = clases.find((item) => item.id === reserva.claseId)
  if (!clase || claseComenzada(clase, reserva.fecha, ahora)) return 'La clase ya comenzó. La reserva queda en tu historial.'
  return ''
}

// Solo copiamos los campos que el cliente puede editar. DNI, plan y estado
// continúan siendo responsabilidad del administrador.
export function prepararPerfil(socio, formulario) {
  return {
    ...socio,
    nombre: formulario.nombre.trim(),
    apellido: formulario.apellido.trim(),
    email: formulario.email.trim(),
    telefono: formulario.telefono.trim(),
    fechaNacimiento: formulario.fechaNacimiento,
  }
}

export function fechaLarga(fecha) {
  return leerFecha(fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
