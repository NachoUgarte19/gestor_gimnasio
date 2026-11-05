import './Privacidad.css'

// Esta pantalla se comparte entre el administrador y el cliente.
// El texto del botón permite volver a la sección correspondiente de cada vista.
// onVolver es una funcion recibida por props. El valor por defecto permite usar el aviso desde el administrador.
function Privacidad({ onVolver, textoVolver = 'Volver a Agenda' }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestor Gym · Privacidad</p>
          <h1>Políticas de privacidad</h1>
          <p className="subtitle">Versión de demostración · Actualización: 29 de octubre de 2026.</p>
        </div>
      </header>

      <article className="privacy-content" aria-label="Información sobre privacidad y uso de datos">
        <p className="privacy-notice">Este aviso describe la demostración académica de Gestor Gym. Usá datos ficticios para probar las funciones.</p>

        <section>
          <h2>Qué información se utiliza</h2>
          <p>Los formularios permiten ingresar nombre, apellido, DNI, correo, teléfono, fecha de nacimiento, fecha de ingreso, plan y estado del socio. También se registran reservas de clases y pagos de cuotas con su fecha, monto y método.</p>
          <p>Los campos obligatorios se identifican en cada formulario. Esta versión no solicita contraseñas ni datos de tarjetas, cuentas bancarias o información médica.</p>
        </section>

        <section>
          <h2>Para qué se utiliza</h2>
          <p>La información permite demostrar la administración del gimnasio: organizar socios y planes, consultar horarios, controlar cupos, gestionar reservas y llevar un registro de pagos. Registrar un pago en esta demostración no realiza un cobro.</p>
        </section>

        <section>
          <h2>Dónde se guarda y durante cuánto tiempo</h2>
          <p>Los datos de los formularios se guardan en el almacenamiento local del navegador, llamado localStorage. Se conservan al recargar y permanecen hasta que se reemplacen con Restaurar ejemplos o se borren los datos de este sitio desde el navegador.</p>
          <p>Esta versión no envía esos registros a una API ni los sincroniza entre dispositivos. Quien tenga acceso al mismo navegador puede consultar la demostración, que se abre sin inicio de sesión.</p>
        </section>

        <section>
          <h2>Cookies y servicios externos</h2>
          <p>La aplicación no utiliza cookies de publicidad ni herramientas de seguimiento. El guardado de la demostración utiliza localStorage. Los enlaces a sitios externos se abren solo si elegís visitarlos y tienen sus propias políticas.</p>
        </section>

        <section>
          <h2>Cómo consultar, corregir o quitar información</h2>
          <p>Los registros se pueden consultar y editar desde las secciones del panel. Para reemplazar toda la información ingresada, usá Restaurar ejemplos. Para quitar también los ejemplos guardados, borrá los datos de este sitio desde la configuración del navegador; al volver a abrir la aplicación se generarán nuevos ejemplos.</p>
          <p>La Agencia de Acceso a la Información Pública ofrece información sobre los derechos de acceso, rectificación y supresión de datos personales en Argentina.</p>
          <a href="https://www.argentina.gob.ar/aaip/datospersonales/derechos" target="_blank" rel="noopener noreferrer">Consultar los derechos sobre datos personales en la AAIP (abre otra pestaña)</a>
        </section>

        <section>
          <h2>Alcance de este aviso</h2>
          <p>Este texto corresponde al funcionamiento local de la entrega académica. Antes de utilizar el sistema con personas reales, se deberán informar la identidad y el contacto del responsable del gimnasio y actualizar este aviso según los servicios, el almacenamiento y los usos que efectivamente se implementen.</p>
        </section>

        <button type="button" className="crud-secondary" onClick={onVolver}>{textoVolver}</button>
      </article>
    </>
  )
}

export default Privacidad
