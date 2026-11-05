// Pruebas de funciones de JavaScript con el ejecutor de Node; no requieren un navegador.
import test from 'node:test'
import assert from 'node:assert/strict'
import { crearDatosIniciales } from '../src/data/datosIniciales.js'
import { validarSocio, validarPlan, validarClase, validarReserva, validarPago } from '../src/utils/validaciones.js'
import { diaDeFecha, fechaTexto, inicioSemana, sumarDias } from '../src/utils/fechas.js'

// Pruebas de reglas del gimnasio; no necesitan React, backend ni dependencias nuevas.
test('los ejemplos son coherentes con todas las validaciones', () => {
  const datos = crearDatosIniciales()
  for (const socio of datos.socios) assert.equal(validarSocio(socio, datos.socios, datos.planes), '')
  for (const plan of datos.planes) assert.equal(validarPlan(plan), '')
  for (const clase of datos.clases) assert.equal(validarClase(clase, datos.clases, datos.reservas), '')
  for (const reserva of datos.reservas) assert.equal(validarReserva(reserva, datos.socios, datos.clases, datos.reservas), '')
  for (const pago of datos.pagos) assert.equal(validarPago(pago, datos.socios), '')
})

test('no se permiten DNI o correos repetidos, pero sí editar al mismo socio', () => {
  const { socios, planes } = crearDatosIniciales()
  const socio = { ...socios[0], id: 99 }
  assert.match(validarSocio(socio, socios, planes), /DNI/)
  socio.dni = '99888777'
  socio.email = socios[0].email.toUpperCase()
  assert.match(validarSocio(socio, socios, planes), /correo/)
  assert.equal(validarSocio(socios[0], socios, planes), '')
})

test('socio con correo inválido, plan inexistente o fechas incoherentes se rechaza', () => {
  const { socios, planes } = crearDatosIniciales()
  assert.match(validarSocio({ ...socios[0], email: 'mal' }, socios, planes), /correo/)
  assert.match(validarSocio({ ...socios[0], planId: 999 }, socios, planes), /plan/)
  assert.match(validarSocio({ ...socios[0], fechaNacimiento: '2999-01-01' }, socios, planes), /futura/)
  assert.match(validarSocio({ ...socios[0], fechaIngreso: '1990-01-01' }, socios, planes), /anterior/)
})

test('los importes deben ser finitos y mayores que cero', () => {
  const { planes, pagos, socios } = crearDatosIniciales()
  for (const valor of [0, -1, NaN, Infinity]) {
    assert.notEqual(validarPlan({ ...planes[0], precio: valor }), '')
    assert.notEqual(validarPago({ ...pagos[0], monto: valor }, socios), '')
  }
})

test('una clase no admite cupos fraccionarios, horarios inválidos ni menos lugares que reservas', () => {
  const { clases, reservas } = crearDatosIniciales()
  assert.match(validarClase({ ...clases[0], cupo: 1.5 }, clases, reservas), /entero/)
  assert.match(validarClase({ ...clases[0], horario: '25:00' }, clases, reservas), /horario/)
  assert.match(validarClase({ ...clases[2], cupo: 1 }, clases, reservas), /menor/)
  assert.match(validarClase({ ...clases[2], dia: 'Jueves' }, clases, reservas), /reservas/)
})

test('reservas: se impiden inactivos, duplicados, día incorrecto y sobrecupo', () => {
  const { socios, clases, reservas } = crearDatosIniciales()
  const reserva = { ...reservas[0], id: null }
  assert.match(validarReserva({ ...reserva, socioId: 4 }, socios, clases, reservas), /inactivo/)
  assert.match(validarReserva(reserva, socios, clases, reservas), /ya tiene/)
  assert.match(validarReserva({ ...reserva, fecha: fechaTexto(sumarDias(inicioSemana(new Date()), 1)) }, socios, clases, reservas), /lunes/)
  assert.match(validarReserva({ ...reservas[2], id: null, socioId: 1 }, socios, clases, reservas), /completa/)
})

test('el cupo es por fecha y al editar no se cuenta la propia reserva', () => {
  const { socios, clases, reservas } = crearDatosIniciales()
  assert.equal(validarReserva(reservas[2], socios, clases, reservas), '')
  const siguienteSemana = fechaTexto(sumarDias(inicioSemana(new Date()), 9))
  assert.equal(validarReserva({ ...reservas[2], id: null, socioId: 1, fecha: siguienteSemana }, socios, clases, reservas), '')
})

test('pagos: se exige socio existente, método permitido y fecha no futura', () => {
  const { socios, pagos } = crearDatosIniciales()
  assert.notEqual(validarPago({ ...pagos[0], socioId: 999 }, socios), '')
  assert.notEqual(validarPago({ ...pagos[0], metodoPago: 'Otro' }, socios), '')
  assert.notEqual(validarPago({ ...pagos[0], fecha: '2999-01-01' }, socios), '')
  assert.equal(validarPago({ ...pagos[0], socioId: 4 }, socios), '')
})

test('las fechas usan días locales y los ejemplos pueden restaurarse sin compartir objetos', () => {
  assert.equal(diaDeFecha('2026-11-05'), 'Jueves')
  const primero = crearDatosIniciales()
  primero.socios[0].nombre = 'Cambiado'
  assert.equal(crearDatosIniciales().socios[0].nombre, 'Ana')
})
