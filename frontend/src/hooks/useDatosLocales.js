import { useEffect, useState } from 'react'
import { crearDatosIniciales } from '../data/datosIniciales.js'

// Hook propio: reúne el estado y el guardado de las cinco listas del gimnasio.
// App lo usa una sola vez y comparte sus resultados con Administrador y Cliente.

// Es el nombre con el que se guarda el conjunto de datos dentro del navegador.
const clave = 'gestor-gym-admin-v1'

// Se utiliza al iniciar. Devuelve los datos guardados o un conjunto de ejemplos.
function cargarDatos() {
  try {
    // localStorage guarda texto; JSON.parse lo convierte otra vez en un objeto.
    // Si la clave no existe, el resultado es null y se usarán ejemplos.
    const guardados = JSON.parse(localStorage.getItem(clave))
    // every exige que las cinco propiedades sean arreglos. Es una revisión del
    // formato general, no una validación de cada socio, clase o reserva individual.
    if (guardados && ['socios', 'clases', 'planes', 'reservas', 'pagos'].every((nombre) => Array.isArray(guardados[nombre]))) return guardados
  } catch {
    // Si el navegador no permite leer o el JSON está dañado, usamos ejemplos.
  }
  return crearDatosIniciales()
}

export default function useDatosLocales() {
  // Pasamos cargarDatos sin paréntesis: React la usa para obtener el estado
  // inicial, en lugar de volver a leer localStorage en cada renderización.
  const [datos, setDatos] = useState(cargarDatos)
  // Este estado comunica si falló el guardado; no contiene los datos del gimnasio.
  const [errorGuardado, setErrorGuardado] = useState('')

  // Guardamos las cinco listas después de cada cambio.
  useEffect(() => {
    try {
      // JSON.stringify convierte el objeto en texto antes de almacenarlo.
      localStorage.setItem(clave, JSON.stringify(datos))
      // Un guardado correcto también retira cualquier advertencia anterior.
      setErrorGuardado('')
    } catch {
      setErrorGuardado('El navegador no pudo guardar los cambios. Se conservarán solo mientras esta página siga abierta.')
    }
  // [datos] ejecuta el efecto al montar y cuando cambia ese estado. No hace
  // falta limpiar este efecto: no deja eventos ni temporizadores registrados.
  }, [datos])

  // nombre indica la lista a reemplazar, por ejemplo 'reservas'. Las otras
  // cuatro se conservan para que las dos vistas mantengan los mismos datos.
  function actualizarLista(nombre, lista) {
    // React entrega el estado previo en 'anteriores'. ... lo copia y [nombre]
    // usa el valor de la variable como propiedad: 'reservas' reemplaza reservas.
    setDatos((anteriores) => ({ ...anteriores, [nombre]: lista }))
  }

  // Genera listas nuevas; el efecto de arriba también las guardará en el navegador.
  function restaurarDatos() {
    setDatos(crearDatosIniciales())
  }

  // Quien use el hook recibe el estado actual y las funciones para actualizarlo.
  return { datos, actualizarLista, restaurarDatos, errorGuardado }
}
