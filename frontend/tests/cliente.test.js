// Pruebas de funciones de JavaScript con el ejecutor de Node; no requieren un navegador.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  claseComenzada, lugaresDisponibles, prepararPerfil, reservasDelSocio,
  validarCancelacionCliente, validarReservaCliente,
} from '../src/modules/cliente/clienteUtils.js'

// Fecha fija para comprobar los límites de horario sin depender del reloj real.
// Fecha fija para que el resultado sea repetible. En JavaScript el mes 10 corresponde a noviembre.
const ahora = new Date(2026, 10, 2, 9, 0)
const socio = { id: 1, nombre: 'Ana', apellido: 'Pérez', activo: true, dni: '40123456', planId: 3, fechaIngreso: '2026-10-05' }
const clase = { id: 1, nombre: 'Yoga', dia: 'Lunes', horario: '10:00', cupo: 2 }
const nueva = { id: null, socioId: 1, claseId: 1, fecha: '2026-11-02' }

test('cliente: una clase se cierra exactamente al comenzar, no al terminar el día', () => {
  assert.equal(claseComenzada(clase, nueva.fecha, ahora), false)
  assert.equal(claseComenzada(clase, nueva.fecha, new Date(2026, 10, 2, 10, 0)), true)
  assert.equal(validarReservaCliente(nueva, socio, [clase], [], ahora), '')
  assert.match(validarReservaCliente(nueva, socio, [clase], [], new Date(2026, 10, 2, 10, 1)), /comenzó/)
})

test('cliente: no puede reservar con otra identidad ni con una cuenta inactiva', () => {
  assert.match(validarReservaCliente({ ...nueva, socioId: 2 }, socio, [clase], [], ahora), /socio seleccionado/)
  assert.match(validarReservaCliente(nueva, { ...socio, activo: false }, [clase], [], ahora), /inactivo/)
})

test('cliente: se vuelve a validar el cupo y los duplicados al confirmar', () => {
  const existente = { ...nueva, id: 1 }
  assert.match(validarReservaCliente(nueva, socio, [clase], [existente], ahora), /ya tiene/)
  const completas = [{ ...existente, socioId: 2 }, { ...existente, id: 2, socioId: 3 }]
  assert.match(validarReservaCliente(nueva, socio, [clase], completas, ahora), /completa/)
  assert.equal(lugaresDisponibles(clase, nueva.fecha, completas), 0)
  assert.equal(lugaresDisponibles(clase, '2026-11-09', completas), 2)
})

test('cliente: puede cancelar sus reservas futuras, incluso inactivo, pero no las ajenas o pasadas', () => {
  assert.equal(validarCancelacionCliente(nueva, { ...socio, activo: false }, [clase], ahora), '')
  assert.notEqual(validarCancelacionCliente({ ...nueva, socioId: 2 }, socio, [clase], ahora), '')
  assert.notEqual(validarCancelacionCliente(nueva, socio, [clase], new Date(2026, 10, 2, 10, 0)), '')
  assert.notEqual(validarCancelacionCliente(undefined, socio, [clase], ahora), '')
})

test('cliente: el historial contiene únicamente sus reservas y se ordena por fecha y hora', () => {
  const tarde = { ...clase, id: 2, horario: '18:00' }
  const reservas = [
    { ...nueva, id: 1, claseId: 2 },
    { ...nueva, id: 2 },
    { ...nueva, id: 3, socioId: 2 },
    { ...nueva, id: 4, fecha: '2026-10-26' },
  ]
  assert.deepEqual(reservasDelSocio(reservas, [clase, tarde], socio.id).map((item) => item.id), [4, 2, 1])
})

test('cliente: editar el perfil conserva DNI, plan, estado e identidad aunque cambien en el borrador', () => {
  const borrador = {
    nombre: ' Ana María ', apellido: ' Pérez ', email: ' ana@ejemplo.com ',
    telefono: ' 1122334455 ', fechaNacimiento: '1997-04-12',
    id: 999, dni: '11111111', planId: null, activo: false, fechaIngreso: '2099-01-01',
  }
  const perfil = prepararPerfil(socio, borrador)
  assert.equal(perfil.nombre, 'Ana María')
  assert.equal(perfil.email, 'ana@ejemplo.com')
  for (const campo of ['id', 'dni', 'planId', 'activo', 'fechaIngreso']) assert.equal(perfil[campo], socio[campo])
  assert.equal(socio.nombre, 'Ana')
})
