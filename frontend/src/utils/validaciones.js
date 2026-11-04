import { diaDeFecha, fechaTexto, diasSemana } from './fechas.js'

// Devuelven un mensaje de error o '' si los datos son válidos.
// También rechazamos textos con espacios: required por sí solo no los rechaza.
export function validarSocio(socio, socios, planes) {
  if (!socio.nombre || !socio.apellido) return 'Completá el nombre y el apellido.'
  if (!/^\d{6,20}$/.test(socio.dni)) return 'Ingresá un DNI de 6 a 20 dígitos, sin puntos.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(socio.email)) return 'Ingresá un correo válido, por ejemplo nombre@correo.com.'
  if (socios.some((otro) => otro.id !== socio.id && otro.dni === socio.dni)) return 'Ya existe un socio con ese DNI.'
  if (socios.some((otro) => otro.id !== socio.id && otro.email.toLowerCase() === socio.email.toLowerCase())) return 'Ya existe un socio con ese correo.'
  if (socio.planId !== null && !planes.some((plan) => plan.id === socio.planId)) return 'Elegí un plan disponible o Sin plan.'
  if (socio.fechaNacimiento > fechaTexto()) return 'La fecha de nacimiento no puede ser futura.'
  if (socio.fechaIngreso > fechaTexto()) return 'La fecha de ingreso no puede ser futura.'
  if (socio.fechaNacimiento && socio.fechaIngreso && socio.fechaNacimiento > socio.fechaIngreso) return 'El nacimiento debe ser anterior a la fecha de ingreso.'
  return ''
}

export function validarPlan(plan) {
  if (!plan.nombre) return 'Completá el nombre del plan.'
  if (!Number.isFinite(plan.precio) || plan.precio <= 0) return 'El precio debe ser mayor a cero.'
  if (plan.beneficios.length > 500) return 'Los beneficios no pueden superar los 500 caracteres.'
  return ''
}

export function validarClase(clase, clases, reservas) {
  if (!clase.nombre || !clase.instructor) return 'Completá el nombre de la clase y el instructor.'
  if (!diasSemana.includes(clase.dia) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(clase.horario)) return 'Elegí un día y un horario válidos.'
  if (!Number.isInteger(clase.cupo) || clase.cupo <= 0) return 'El cupo debe ser un número entero mayor a cero.'
  const anterior = clases.find((item) => item.id === clase.id)
  const propias = reservas.filter((reserva) => reserva.claseId === clase.id)
  if (anterior && anterior.dia !== clase.dia && propias.length > 0) return 'La clase tiene reservas. Cancelalas antes de cambiar el día.'
  // El cupo se controla por fecha, porque la misma clase se repite cada semana.
  for (const reserva of propias) {
    if (propias.filter((item) => item.fecha === reserva.fecha).length > clase.cupo) return 'El cupo no puede ser menor que las reservas existentes para una fecha.'
  }
  return ''
}

export function validarReserva(reserva, socios, clases, reservas) {
  const socio = socios.find((item) => item.id === reserva.socioId)
  const clase = clases.find((item) => item.id === reserva.claseId)
  if (!socio || !clase || !reserva.fecha) return 'Elegí un socio, una clase y una fecha.'
  if (!socio.activo) return 'El socio está inactivo. Activá su cuenta desde Socios antes de reservar.'
  if (diaDeFecha(reserva.fecha) !== clase.dia) return `La fecha debe corresponder a un ${clase.dia.toLowerCase()}.`
  const otras = reservas.filter((item) => item.id !== reserva.id)
  if (otras.some((item) => item.socioId === reserva.socioId && item.claseId === reserva.claseId && item.fecha === reserva.fecha)) return 'El socio ya tiene una reserva para esa clase y fecha.'
  if (otras.filter((item) => item.claseId === reserva.claseId && item.fecha === reserva.fecha).length >= clase.cupo) return 'La clase está completa para esa fecha. Elegí otra clase o semana.'
  return ''
}

export const metodosPago = ['Efectivo', 'Transferencia', 'Tarjeta']

export function validarPago(pago, socios) {
  if (!socios.some((socio) => socio.id === pago.socioId)) return 'Elegí un socio disponible.'
  if (!Number.isFinite(pago.monto) || pago.monto <= 0) return 'El monto debe ser mayor a cero.'
  if (!pago.fecha || pago.fecha > fechaTexto()) return 'Ingresá una fecha de pago que no sea futura.'
  if (!metodosPago.includes(pago.metodoPago)) return 'Elegí un método de pago disponible.'
  return ''
}
