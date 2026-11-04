import { fechaTexto, inicioSemana, sumarDias } from '../utils/fechas.js'

// Se crea una copia nueva al restaurar ejemplos.
// Incluimos la semana actual y un turno anterior para demostrar cupos e historial.
export function crearDatosIniciales() {
  const lunes = inicioSemana(new Date())
  const hoy = fechaTexto()
  return {
    planes: [
      { id: 1, nombre: 'Plan Básico', precio: 20000, beneficios: 'Acceso al gimnasio y clases grupales' },
      { id: 2, nombre: 'Plan Plus', precio: 28000, beneficios: 'Clases grupales y seguimiento mensual' },
      { id: 3, nombre: 'Plan Full', precio: 35000, beneficios: 'Clases grupales y asesoramiento personalizado' },
    ],
    socios: [
      { id: 1, nombre: 'Ana', apellido: 'Pérez', dni: '40123456', email: 'ana.perez@ejemplo.com', telefono: '11 4567-8901', fechaNacimiento: '1997-04-12', fechaIngreso: hoy, planId: 3, activo: true },
      { id: 2, nombre: 'Juan', apellido: 'Gómez', dni: '38987654', email: 'juan.gomez@ejemplo.com', telefono: '11 4321-7654', fechaNacimiento: '1995-08-20', fechaIngreso: hoy, planId: 1, activo: true },
      { id: 3, nombre: 'Lucía', apellido: 'Fernández', dni: '42555111', email: 'lucia.fernandez@ejemplo.com', telefono: '', fechaNacimiento: '', fechaIngreso: hoy, planId: 3, activo: true },
      { id: 4, nombre: 'Martín', apellido: 'Rodríguez', dni: '36777888', email: 'martin.rodriguez@ejemplo.com', telefono: '', fechaNacimiento: '', fechaIngreso: hoy, planId: null, activo: false },
      { id: 5, nombre: 'Sofía', apellido: 'López', dni: '44777123', email: 'sofia.lopez@ejemplo.com', telefono: '', fechaNacimiento: '', fechaIngreso: hoy, planId: 1, activo: true },
      { id: 6, nombre: 'Diego', apellido: 'Martínez', dni: '35999123', email: 'diego.martinez@ejemplo.com', telefono: '', fechaNacimiento: '', fechaIngreso: hoy, planId: 2, activo: false },
    ],
    clases: [
      { id: 1, nombre: 'Funcional', instructor: 'Lucía Gómez', dia: 'Lunes', horario: '08:00', cupo: 12 },
      { id: 2, nombre: 'Yoga', instructor: 'Martina Díaz', dia: 'Martes', horario: '09:00', cupo: 4 },
      { id: 3, nombre: 'Spinning', instructor: 'Nicolás Ruiz', dia: 'Miércoles', horario: '18:00', cupo: 2 },
      { id: 4, nombre: 'Pilates', instructor: 'Carla López', dia: 'Jueves', horario: '17:00', cupo: 12 },
      { id: 5, nombre: 'Funcional', instructor: 'Lucía Gómez', dia: 'Viernes', horario: '08:00', cupo: 12 },
      { id: 6, nombre: 'Yoga', instructor: 'Martina Díaz', dia: 'Sábado', horario: '10:00', cupo: 10 },
    ],
    reservas: [
      { id: 1, socioId: 1, claseId: 1, fecha: fechaTexto(lunes) },
      { id: 2, socioId: 2, claseId: 2, fecha: fechaTexto(sumarDias(lunes, 1)) },
      { id: 3, socioId: 3, claseId: 3, fecha: fechaTexto(sumarDias(lunes, 2)) },
      { id: 4, socioId: 5, claseId: 3, fecha: fechaTexto(sumarDias(lunes, 2)) },
      { id: 5, socioId: 1, claseId: 4, fecha: fechaTexto(sumarDias(lunes, 3)) },
      { id: 6, socioId: 1, claseId: 6, fecha: fechaTexto(sumarDias(lunes, -2)) },
      { id: 7, socioId: 1, claseId: 6, fecha: fechaTexto(sumarDias(lunes, 5)) },
    ],
    pagos: [
      { id: 1, socioId: 1, monto: 35000, fecha: hoy, metodoPago: 'Transferencia' },
      { id: 2, socioId: 2, monto: 20000, fecha: hoy, metodoPago: 'Efectivo' },
      { id: 3, socioId: 3, monto: 35000, fecha: hoy, metodoPago: 'Tarjeta' },
      { id: 4, socioId: 5, monto: 20000, fecha: hoy, metodoPago: 'Transferencia' },
      { id: 5, socioId: 4, monto: 28000, fecha: hoy, metodoPago: 'Efectivo' },
    ],
  }
}
