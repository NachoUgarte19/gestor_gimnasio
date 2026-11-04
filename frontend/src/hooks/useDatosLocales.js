import { useEffect, useState } from 'react'
import { crearDatosIniciales } from '../data/datosIniciales.js'

const clave = 'gestor-gym-admin-v1'

function cargarDatos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(clave))
    if (guardados && ['socios', 'clases', 'planes', 'reservas', 'pagos'].every((nombre) => Array.isArray(guardados[nombre]))) return guardados
  } catch {
    // Si el navegador no permite leer o el JSON está dañado, usamos ejemplos.
  }
  return crearDatosIniciales()
}

export default function useDatosLocales() {
  const [datos, setDatos] = useState(cargarDatos)
  const [errorGuardado, setErrorGuardado] = useState('')

  // Guardamos las cinco listas después de cada cambio.
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(datos))
      setErrorGuardado('')
    } catch {
      setErrorGuardado('El navegador no pudo guardar los cambios. Se conservarán solo mientras esta página siga abierta.')
    }
  }, [datos])

  function actualizarLista(nombre, lista) {
    setDatos((anteriores) => ({ ...anteriores, [nombre]: lista }))
  }

  function restaurarDatos() {
    setDatos(crearDatosIniciales())
  }

  return { datos, actualizarLista, restaurarDatos, errorGuardado }
}
