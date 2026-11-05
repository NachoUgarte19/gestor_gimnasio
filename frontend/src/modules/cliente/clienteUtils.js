import { leerFecha } from '../../utils/fechas.js'
import { validarReserva } from '../../utils/validaciones.js'

// Funciones auxiliares de la vista del socio. Son JavaScript normal: reciben
// datos y devuelven resultados; no dibujan pantallas ni modifican el estado.

// Combina la fecha de una reserva con el horario de su clase semanal.
// Ejemplo: '2026-11-06' y '08:00' se convierten en un Date de ese día a las 8.
export function inicioClase(clase, fecha) {
  // leerFecha arma una fecha local para evitar que UTC cambie el día.
  const inicio = leerFecha(fecha)
  // split separa '08:30' en dos textos; map(Number) los convierte en números.
  const [hora, minutos] = clase.horario.split(':').map(Number)
  // El último par de ceros corresponde a los segundos y los milisegundos.
  inicio.setHours(hora, minutos, 0, 0)
  return inicio
}

// Compara fecha y hora completas. A partir del inicio ya no se puede reservar.
// La pantalla usa el reloj actual; las pruebas pueden pasar un 'ahora' fijo.
export function claseComenzada(clase, fecha, ahora = new Date()) {
  return inicioClase(clase, fecha) <= ahora
}

// El cupo se calcula por turno: las reservas de otra semana no ocupan lugares.
export function lugaresDisponibles(clase, fecha, reservas) {
  const ocupados = reservas.filter((reserva) => reserva.claseId === clase.id && reserva.fecha === fecha).length
  // Math.max evita mostrar números negativos si los datos ya superan el cupo.
  return Math.max(0, clase.cupo - ocupados)
}

// Filtramos por el socio actual antes de ordenar; nunca mostramos reservas ajenas.
export function reservasDelSocio(reservas, clases, socioId) {
  return reservas
    // filter conserva únicamente los registros de la cuenta seleccionada.
    .filter((reserva) => reserva.socioId === socioId)
    // Cada copia incorpora la clase completa para mostrar nombre e instructor.
    .map((reserva) => ({ ...reserva, clase: clases.find((clase) => clase.id === reserva.claseId) }))
    // AAAA-MM-DD se puede ordenar como texto. Si las fechas son iguales (0),
    // el || continúa comparando los horarios. ?. contempla una clase ausente.
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.clase?.horario || '').localeCompare(b.clase?.horario || ''))
}

// Las validaciones devuelven un mensaje si hay un problema y '' si todo está bien.
// Acá se agregan las reglas del cliente a las validaciones compartidas del gimnasio.
export function validarReservaCliente(reserva, socio, clases, reservas, ahora = new Date()) {
  // El formulario no puede crear una inscripción para otra cuenta.
  if (reserva.socioId !== socio.id) return 'La reserva debe pertenecer al socio seleccionado.'
  // [socio] es una lista con un único elemento, como espera validarReserva.
  // Esa función comprueba estado activo, día correcto, duplicados y cupo.
  const error = validarReserva(reserva, [socio], clases, reservas)
  // return corta la función y permite mostrar el error sin seguir confirmando.
  if (error) return error
  const clase = clases.find((item) => item.id === reserva.claseId)
  // Se revisa nuevamente al confirmar por si pasó tiempo desde que abrió la pantalla.
  if (claseComenzada(clase, reserva.fecha, ahora)) return 'Esta clase ya comenzó. Elegí un turno futuro.'
  return ''
}

// Solo se cancelan reservas propias de turnos futuros. Un socio inactivo
// también puede cancelarlas: no hace falta comprobar 'activo' en esta operación.
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
    // Partimos del registro actual para conservar id, DNI, plan, estado e ingreso.
    ...socio,
    // Solo se reemplazan los campos editables. trim quita espacios de los extremos.
    nombre: formulario.nombre.trim(),
    apellido: formulario.apellido.trim(),
    email: formulario.email.trim(),
    telefono: formulario.telefono.trim(),
    fechaNacimiento: formulario.fechaNacimiento,
  }
}

// Convierte una fecha guardada en un texto legible, por ejemplo:
// '2026-11-05' -> 'jueves, 5 de noviembre de 2026'. No cambia el valor almacenado.
export function fechaLarga(fecha) {
  return leerFecha(fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
