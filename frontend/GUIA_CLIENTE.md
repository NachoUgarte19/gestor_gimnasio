# Vista del cliente: explicación del código y funcionamiento

La vista del socio implementa las cuatro pantallas del mockup docs/mockups/06-vista-socio.html. Funciona con los mismos datos locales del administrador: no hay una API ni una base de datos conectada.

## Abrir la vista

Iniciá Vite con npm --prefix .\frontend run dev y abrí la dirección que indique con /#cliente al final. Por ejemplo: http://localhost:5173/#cliente.

También podés usar el selector Administrador / Cliente de la parte superior. Dentro del cliente, Socio de ejemplo permite probar las cuentas de Ana, Juan y los demás ejemplos. Esto simula la elección de una cuenta para la entrega; no es un inicio de sesión real.

## Archivos y responsabilidades

```text
src/App.jsx                         selector de vistas y datos compartidos
src/modules/administrador/
  Administrador.jsx                 menú y pantallas del administrador
src/modules/cliente/
  Cliente.jsx                       cuenta elegida, navegación y guardado
  Cliente.css                       diseño propio de la vista del socio
  clienteUtils.js                   fechas, cupos y reglas específicas del cliente
  clases/
    ClasesCliente.jsx               semana, búsqueda y clases disponibles
  reservas/
    ConfirmarReserva.jsx            resumen previo a confirmar
    MisReservas.jsx                 próximas reservas, cancelación e historial
  perfil/
    PerfilCliente.jsx               datos personales, plan y pagos
src/modules/privacidad/
  Privacidad.jsx                    aviso compartido por ambas vistas
tests/cliente.test.js                pruebas de las reglas del cliente
```

Se conservaron React, Vite y CSS. No se agregaron librerías. Los comentarios explican los puntos en los que importa el manejo de identidad, fechas o datos compartidos.

## Cómo comparten datos las dos vistas

App utiliza useDatosLocales una sola vez y conserva las cinco listas: socios, clases, planes, reservas y pagos. Luego pasa datos y actualizarLista a Administrador o Cliente.

Cliente no mantiene una segunda copia de las reservas. Cuando se confirma una inscripción, agrega un registro en datos.reservas mediante actualizarLista. El administrador recibe esa misma lista y calcula el nuevo cupo en Agenda.

Lo mismo ocurre con el perfil: al guardar los datos personales se reemplaza al socio dentro de datos.socios. Los cambios aparecen en el listado del administrador y se conservan al recargar mediante localStorage.

Para demostrar la información compartida, usá el selector superior dentro de la misma dirección. localhost y 127.0.0.1 tienen almacenamientos independientes.

## Cliente.jsx: coordinador del recorrido

El componente tiene estados simples:

- socioId identifica a la persona elegida en la demostración.
- pantalla indica Clases, Confirmar reserva, Mis reservas, Perfil o Privacidad.
- seleccion contiene únicamente el claseId y la fecha del turno que se quiere reservar.
- mensaje y error comunican el resultado de una operación.

Las funciones principales son navegar, cambiarSocio, elegirClase, confirmarReserva, cancelarReserva y guardarPerfil. Cada una tiene una responsabilidad concreta.

Al cambiar de socio se limpian la selección y los mensajes y se vuelve a Clases. Los componentes se reinician con la key del socio para que no quede un borrador de otra persona.

Al navegar, el foco pasa al contenido y la página vuelve al inicio de esa sección. Mensaje anuncia los resultados y lleva el foco al mensaje cuando corresponde.

## Clases disponibles

La pantalla conserva el saludo, el estado de la cuenta, los días de la semana y las tarjetas del mockup. La duración de las clases no se inventó: el modelo actual solo tiene horario de inicio.

Se puede cambiar de semana, volver a Hoy, elegir un día, buscar por clase o instructor y mostrar solo turnos futuros con lugares. Las búsquedas ignoran tildes y mayúsculas.

Cada tarjeta obtiene sus lugares libres restando las reservas de esa clase y esa fecha al cupo. El botón indica el estado:

| Estado | Comportamiento |
| --- | --- |
| Disponible | Reservar lugar abre el resumen de confirmación. |
| Ya reservada | Ver mi reserva lleva a Mis reservas. |
| Completa | No permite nuevas inscripciones. |
| Cuenta inactiva | Explica que recepción debe activar al socio. |
| Turno iniciado | No permite reservar esa fecha y horario. |

El control considera la hora, no solo el día: una clase de hoy sigue disponible hasta su inicio. Al confirmar se vuelve a comprobar el horario actual por si el turno comenzó mientras la pantalla estaba abierta.

La tarjeta Tu próxima clase muestra la reserva futura más cercana de esa cuenta y permite ir a Mis reservas. La fecha y los filtros se conservan al volver de la confirmación.

## Confirmación de reserva

El resumen presenta clase, fecha, hora, instructor, socio, plan y lugares disponibles. No se permite escribir otra fecha en esta pantalla: corresponde al día elegido en el listado.

Confirmar reserva comprueba que el socio esté activo, que la clase exista, que coincida el día, que haya cupo y que no exista una inscripción duplicada. También impide reservar un turno que ya empezó.

El socioId se toma de la cuenta elegida, no de un campo editable. Si la validación es correcta, se agrega la reserva, se abre Mis reservas y se muestra la confirmación.

El plan no restringe las clases. La cuenta activa puede reservar incluso sin plan asignado, de acuerdo con el modelo del proyecto.

## Mis reservas

Primero se filtran las reservas por socioId. Después se ordenan por fecha y horario y se separan entre próximas e históricas. Las reservas de los demás socios no se muestran.

Cancelar reserva abre una confirmación dentro de la tarjeta. Conservar reserva cierra esa confirmación. Sí, cancelar vuelve a verificar que la inscripción sea de esa cuenta y que el turno no haya comenzado; luego elimina el registro y libera el lugar.

Un socio inactivo puede cancelar sus reservas futuras. Las reservas pasadas quedan como información histórica y no tienen botón de cancelación. No se afirma que la persona haya asistido, porque el modelo no registra asistencia.

Como en el administrador, la cancelación quita el registro local: no se guarda una lista separada de cancelaciones.

## Perfil, plan y pagos

Perfil muestra nombre completo, correo, DNI, teléfono, nacimiento e ingreso. También presenta el plan actual, su precio y beneficios y el estado de la cuenta.

Editar mis datos permite modificar nombre, apellido, correo, teléfono y nacimiento. El formulario trabaja con una copia: Cancelar edición la descarta sin cambiar la tabla del administrador.

prepararPerfil copia únicamente esos campos editables sobre el socio actual. Aunque el borrador contuviera otros valores, no modifica id, DNI, plan, estado ni ingreso. Las validaciones compartidas impiden correos repetidos y fechas incoherentes.

La sección Pagos muestra el último registro y permite desplegar todo el historial de la cuenta. Se presentan fecha, monto y método. No se procesan cobros ni se infiere si la cuota está al día, porque esos comportamientos no forman parte del modelo actual.

## Privacidad

Políticas de privacidad está disponible al pie de la vista y desde Perfil. Reutiliza el aviso existente y permite volver a Mi perfil.

No se pide aceptar un texto para entrar a la demostración: se navega con cuentas de ejemplo y sin un formulario de registro. Si se implementa un registro real en otra etapa, deberá incluir acceso al aviso antes de ingresar los datos.

## Diseño y accesibilidad

Cliente.css utiliza clases que empiezan con client- para no cambiar las tablas ni los formularios del administrador. Conserva el azul, el verde, las tarjetas y la jerarquía del mockup.

En computadora, el menú Clases / Mis reservas / Perfil está a la izquierda, con una barra similar a la del administrador y el contenido a la derecha. En celular, las tarjetas pasan a una columna y el menú permanece en la parte inferior mientras se recorre la página. Se utiliza un único menú: CSS cambia su ubicación según el tamaño de pantalla, sin duplicar botones ni lógica.

Se usan etiquetas de campos, encabezados, secciones con nombres accesibles, botones con foco visible, estados con texto y cantidades y mensajes anunciados. El selector de día informa qué opción está elegida. El enlace Saltar al contenido permite pasar directamente a la pantalla activa sin cambiar de vista.

## Ejemplos y pruebas

Los ejemplos nuevos incluyen una reserva de una semana anterior y otra para el sábado de la semana actual, para demostrar historial y próximas clases. Los datos ya guardados se conservan; Restaurar ejemplos, desde el administrador, permite reemplazarlos por un conjunto nuevo después de confirmar.

El comando npm --prefix .\frontend test ejecuta quince pruebas: nueve compartidas y seis específicas del cliente. Las nuevas cubren el horario de inicio, la identidad de la cuenta, inactivos, duplicados, cupos por fecha, cancelación, separación de historiales y protección de los campos del perfil.

## Recorrido para la entrega

1. Abrir Cliente y elegir a Ana.
2. Buscar una clase futura con lugares y mostrar su confirmación.
3. Confirmar, comprobar la inscripción en Mis reservas y recargar la página.
4. Cambiar a Administrador y comprobar la reserva y el cupo de Agenda.
5. Volver al cliente, cancelar y comprobar que se libera el lugar.
6. Desplegar el historial de reservas.
7. Editar un teléfono desde Perfil y verlo actualizado en Socios.
8. Intentar un correo que ya tenga otro socio para mostrar el error.
9. Desplegar el historial de pagos y abrir Privacidad.
10. Elegir un socio inactivo y mostrar la explicación y el botón de reserva deshabilitado.
11. Elegir Spinning en la semana de los ejemplos para mostrar una clase completa.
12. Repetir parte del recorrido con teclado y en formato celular.

La integración HTTP, el inicio de sesión y la autorización real de cada cuenta quedan para la siguiente etapa. Las comprobaciones del navegador permiten demostrar el recorrido; cuando se conecte el backend, esas reglas también deberán verificarse en el servidor.
