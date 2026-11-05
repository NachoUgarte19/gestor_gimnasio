import { useEffect, useRef } from 'react'

// El foco lleva al resultado después de guardar y evita perderse al cerrar el formulario.
// Si texto esta vacio no dibujamos nada. error elige el aspecto y el anuncio accesible.
export default function Mensaje({ texto, error = false }) {
  // La referencia apunta al elemento HTML; cambiar una ref no vuelve a renderizar el componente.
  const mensaje = useRef(null)
  useEffect(() => {
    if (texto) mensaje.current?.focus()
  }, [texto])

  if (!texto) return null
  return <p ref={mensaje} tabIndex="-1" className={'message ' + (error ? 'message-error' : 'message-success')} role={error ? 'alert' : 'status'}>{texto}</p>
}
