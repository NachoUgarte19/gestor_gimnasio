# Guía del frontend de Gestor Gym

Esta guía explica el frontend de la entrega del jueves 5 de noviembre de 2026. Está pensada para leer junto al código y poder explicar qué hace cada parte. El recorrido del socio se detalla en [GUIA_CLIENTE.md](GUIA_CLIENTE.md).

## 1. Qué incluye

El panel permite recorrer seis secciones:

| Pantalla | Para qué sirve |
| --- | --- |
| Agenda | Ver las clases semanales, horarios y lugares libres por fecha. |
| Socios | Crear, buscar, editar, activar, desactivar y eliminar socios sin historial asociado. |
| Clases | Administrar los turnos semanales, instructores y cupos. |
| Planes | Administrar los precios y beneficios de las membresías. |
| Reservas | Inscribir un socio a una clase en una fecha, modificar la inscripción o cancelarla. |
| Pagos | Registrar, buscar, filtrar, modificar y eliminar pagos de cuotas. |

Todas las pantallas usan el mismo conjunto de datos. Por eso una clase nueva aparece en Agenda y en el selector de Reservas, y un cambio de nombre de un socio se refleja también en sus pagos y reservas.

La aplicación funciona sin backend. El selector superior permite recorrer Administrador y Cliente; el distintivo Administrador identifica la vista, pero no representa un inicio de sesión ni un control real de permisos.

La vista React del socio está implementada y toma como referencia el HTML de docs/mockups/06-vista-socio.html. Incluye clases disponibles, confirmación de reserva, mis reservas y perfil con plan y pagos.

## 2. Tecnologías

- **React:** dibuja la interfaz y la actualiza cuando cambian los datos.
- **JSX:** permite escribir la estructura de las pantallas dentro de los archivos JavaScript.
- **CSS:** define colores, espacios, tamaños, grillas y adaptaciones para celular.
- **Vite:** inicia el servidor de desarrollo y genera la versión compilada.
- **localStorage:** guarda un texto JSON en el navegador para conservar la demo al recargar.
- **Node test runner:** ejecuta las pruebas de validaciones sin agregar librerías.

No se agregaron bibliotecas de formularios, de estado global, de tablas ni de navegación. El menú usa un estado de React para elegir la pantalla.

## 3. Estructura de carpetas

```text
frontend/
  index.html
  package.json
  vite.config.js
  README.md
  GUIA_FRONTEND.md
  tests/
    validaciones.test.js
  src/
    main.jsx
    App.jsx
    App.css
    components/
      Encabezado.jsx
      Mensaje.jsx
    data/
      datosIniciales.js
    hooks/
      useDatosLocales.js
    utils/
      fechas.js
      listas.js
      validaciones.js
    styles/
      base.css
      Crud.css
      Listados.css
    modules/
      administrador/Administrador.jsx
      cliente/Cliente.jsx, Cliente.css, clienteUtils.js
        clases/ClasesCliente.jsx
        reservas/ConfirmarReserva.jsx, MisReservas.jsx
        perfil/PerfilCliente.jsx
      agenda/Agenda.jsx, Agenda.css
      socios/Socios.jsx, Socios.css
      clases/Clases.jsx
      planes/Planes.jsx
      reservas/Reservas.jsx
      pagos/Pagos.jsx
      privacidad/Privacidad.jsx, Privacidad.css
```

Cada módulo conserva sus interacciones, su formulario y su tabla. Los elementos repetidos y las funciones pequeñas tienen archivos compartidos. Se mantiene una separación sencilla para encontrar el código sin recorrer una única pantalla gigante.

## 4. Cómo arranca la aplicación

1. El navegador abre index.html.
2. Ese archivo tiene un div con id root y carga src/main.jsx.
3. main.jsx importa los estilos generales y dibuja App dentro de root.
4. App conserva los datos compartidos y muestra el selector entre Administrador y Cliente.
5. Administrador contiene el menú y sus seis módulos. Cliente contiene el recorrido del socio. La dirección /#cliente permite abrirlo directamente.

StrictMode está activo para ayudar a detectar problemas durante el desarrollo. No agrega una pantalla ni necesita configuración del usuario.

Cada vista actualiza el título de la pestaña. Por ejemplo, al entrar a Socios se ve Socios | Gestor Gym.

## 5. Cómo se organizan los datos

App usa el hook useDatosLocales. Un hook es una función que agrupa lógica de React; en este caso reúne la lectura, actualización y escritura de los datos locales.

El objeto datos contiene cinco arreglos:

```js
{
  socios: [],
  clases: [],
  planes: [],
  reservas: [],
  pagos: []
}
```

Para relacionar los registros se guardan identificadores:

```js
// El socio tiene un plan opcional.
{ id: 7, nombre: 'Ejemplo', planId: 1 }

// La reserva relaciona un socio, una clase y una fecha.
{ id: 6, socioId: 7, claseId: 4, fecha: '2026-11-05' }

// El pago pertenece a un socio.
{ id: 6, socioId: 7, monto: 20000, fecha: '2026-11-05', metodoPago: 'Efectivo' }
```

Son ejemplos abreviados para mostrar las relaciones, no todos los atributos de cada registro.

Se guarda el id y se busca el nombre al dibujar la pantalla. Si se guardara una copia del nombre en cada pago, al editar el socio quedarían nombres viejos. Con los ids, todas las pantallas consultan el dato actual.

Los planes no tienen una lista de clases. Cualquier socio activo puede reservar cualquier clase aunque no tenga un plan asignado, según el modelo actual del proyecto.

## 6. Props: cómo recibe datos cada módulo

Las props son los datos y funciones que un componente padre pasa a un componente hijo.

Por ejemplo, Administrador recibe los datos de App y le pasa a Clases:

```jsx
<Clases
  lista={datos.clases}
  reservas={datos.reservas}
  setLista={(lista) => actualizarLista('clases', lista)}
/>
```

- lista contiene las clases.
- reservas permite comprobar si una clase tiene inscripciones.
- setLista recibe la nueva lista de clases y la actualiza en App.

actualizarLista conserva las otras cuatro listas. Como Agenda recibe datos.clases del mismo App, React vuelve a dibujar la agenda cuando se guarda una clase.

Los módulos permanecen montados y se ocultan con hidden. Esto conserva filtros y formularios al ir de una sección a otra. El contenido oculto queda fuera de la navegación por teclado y del árbol de accesibilidad. Al restaurar los ejemplos se reinician también esos estados.

## 7. El patrón común de los formularios

Los cinco módulos de gestión siguen la misma idea:

1. formulario comienza en null: no hay formulario visible.
2. Nuevo lo reemplaza por un objeto vacío con valores iniciales.
3. Editar copia el registro seleccionado.
4. Los inputs muestran los valores del objeto formulario.
5. cambiar(campo, valor) actualiza solo el dato que se está editando.
6. Guardar evita la recarga normal del formulario con preventDefault.
7. Se limpian espacios y se convierten los números cuando corresponde.
8. Se validan los datos.
9. Se agrega el registro nuevo o se reemplaza el existente.
10. Se cierra el formulario y se muestra un mensaje de éxito.

Copiar el registro al editar evita cambiar la tabla antes de presionar Guardar. Cancelar descarta el borrador y muestra que no se guardaron cambios.

Los campos usan onChange para actualizar el borrador. Los controles nativos de fecha y hora usan onInput para tomar su valor al ingresarlo.

## 8. Qué significan las operaciones con arreglos

Estas son las operaciones que más se repiten:

- **map:** transforma elementos. En JSX crea una fila por registro; al editar, reemplaza solo el registro cuyo id coincide.
- **filter:** conserva elementos que cumplen una condición. Se usa para buscar y para quitar un registro.
- **find:** busca un solo elemento, por ejemplo el plan de un socio.
- **some:** indica si existe al menos una coincidencia. Se usa para comprobar duplicados o relaciones.
- **reduce:** acumula un resultado, por ejemplo la suma de los pagos visibles.
- **sort:** ordena las listas que se muestran.

El operador ... copia los datos de un objeto o arreglo. React recibe un objeto o arreglo nuevo en cada actualización; no se modifica directamente el que está en pantalla.

siguienteId calcula el mayor id actual y suma uno. Es una identificación local para la demostración. En una futura integración, los ids los deberá generar el backend.

## 9. Agenda

La agenda muestra siete días, de lunes a domingo. inicioSemana obtiene el lunes correspondiente a la fecha actual.

Los botones permiten ir a la semana anterior, a la siguiente o volver a Hoy. Se muestran las fechas con año para evitar confusiones al cambiar de mes.

Los horarios se obtienen de las clases existentes. Para cada día y horario se buscan las clases correspondientes. Como las clases son semanales, aparecen también en otras semanas.

Para calcular la disponibilidad se cuentan las reservas que tienen el mismo claseId y la misma fecha. Luego se resta esa cantidad al cupo:

```text
lugares libres = cupo de la clase - reservas de esa clase y fecha
```

Hay tres estados: Disponible, Pocos lugares (hasta tres libres) y Completa. Cada tarjeta incluye texto y cantidades; el significado no depende únicamente del color.

La tarjeta de una clase es informativa. Las modificaciones se hacen desde Clases y las inscripciones desde Reservas; la ayuda de la pantalla lo indica.

En computadora se presenta una grilla semanal. En celular se muestran las clases agrupadas por día. Ambas vistas se generan desde los mismos datos.

## 10. Socios

Se muestran nombre y apellido, DNI, correo, teléfono, plan, ingreso, estado y acciones.

El buscador admite nombre, apellido, DNI o correo. La búsqueda ignora mayúsculas y tildes. Además se puede filtrar por activos o inactivos.

Las tarjetas cuentan todos los socios, activos e inactivos. El texto Mostrando indica cuántos quedaron después de aplicar los filtros.

El formulario tiene nombre, apellido, DNI, correo, teléfono, nacimiento, plan e ingreso. El plan se elige de las opciones creadas en Planes; también puede quedar Sin plan.

Un socio nuevo comienza activo. Al editar aparece Estado para activarlo o desactivarlo sin borrar su historial.

Se valida que el DNI y el correo no estén repetidos, que el correo tenga un formato válido y que las fechas sean coherentes. El DNI se ingresa con entre 6 y 20 dígitos, sin puntos.

Si tiene pagos o reservas, no se permite eliminarlo. Se informa que se puede desactivar desde Editar. Esta comprobación evita dejar registros relacionados sin socio.

## 11. Clases

Cada clase guarda nombre, instructor, día semanal, horario y cupo por fecha.

El módulo permite alta, edición, eliminación, búsqueda por texto y filtro por día. Las tarjetas separan clases anteriores a las 12:00 y clases desde el mediodía.

El cupo debe ser un entero mayor a cero. Tampoco puede bajarse por debajo de las reservas existentes en alguna fecha.

Si la clase tiene reservas, se impide cambiar el día hasta cancelar esas inscripciones, para no dejar fechas incompatibles. También se bloquea su eliminación mientras tenga reservas.

Cambiar el horario modifica el turno semanal que se muestra en las reservas y en la agenda: las reservas apuntan a la clase, no a una copia de su horario.

## 12. Planes

Cada plan guarda nombre, precio mensual y una descripción opcional de beneficios.

Hay alta, edición, eliminación y búsqueda por nombre o beneficios. Se muestra cuántos socios tienen cada plan.

Las tarjetas muestran cantidad de planes y precios mínimo y máximo. Si no hay planes se muestra un guion en los precios.

El precio debe ser mayor a cero. Los beneficios admiten hasta 500 caracteres y el formulario muestra el contador.

No se puede eliminar un plan mientras tenga socios asignados. Primero hay que cambiarles el plan o dejarlos Sin plan desde Socios.

## 13. Reservas

Cada reserva une un socio, una clase y una fecha de asistencia.

El selector de socios incluye el DNI para distinguir personas con nombres iguales. Los inactivos se identifican expresamente; si se intenta reservar para uno, se explica cómo activarlo.

El selector de clases indica nombre, día y horario. Al elegir una clase se informa el día en que se dicta y, si la fecha coincide, la cantidad de lugares disponibles.

Se comprueba que:

- Existan el socio y la clase.
- El socio esté activo.
- La fecha corresponda al día semanal de la clase.
- No haya una reserva del mismo socio para la misma clase y fecha.
- Todavía haya cupo para esa fecha.

Al editar, la propia reserva no se cuenta como otro lugar ocupado. Una clase completa esta semana puede tener lugares la semana siguiente: el cupo se controla por fecha.

Se permite registrar fechas pasadas para administrar el historial. La fecha de asistencia se comprueba contra el día semanal de la clase.

Se puede buscar por socio, clase o instructor y filtrar por fecha. Todas las fechas quita el filtro de fecha. Las tarjetas muestran reservas totales, para hoy y posteriores a hoy.

Cancelar reserva pide confirmación y libera el lugar en Agenda. No representa una cancelación real en un servidor.

## 14. Pagos

El formulario permite elegir socio, monto, fecha y método de pago. Los métodos son Efectivo, Transferencia y Tarjeta.

También se pueden registrar pagos de socios inactivos, por ejemplo para completar su historial.

Los pagos se ordenan por fecha descendente. Se pueden buscar por socio o método y filtrar por método.

Las tarjetas corresponden a los resultados filtrados: cantidad, suma de importes y número de transferencias. Sus etiquetas lo aclaran.

El monto debe ser finito y mayor a cero. La fecha no puede ser futura y el socio elegido debe existir.

Editar modifica el pago local. Eliminar pide confirmación. La aplicación no cobra ni procesa dinero; permite administrar registros simulados de cuotas.

## 15. Validaciones y mensajes

Hay dos niveles:

1. HTML usa required, type, min, max, step, pattern y maxLength cuando corresponden. El navegador identifica campos vacíos o formatos incorrectos.
2. utils/validaciones.js comprueba reglas del negocio: duplicados, estados, relaciones, cupos y fechas.

Las funciones de validación reciben datos y devuelven un texto de error o una cadena vacía si todo es válido. No necesitan conocer React.

Mensaje muestra errores con role=alert y resultados correctos con role=status. Al aparecer un mensaje, el foco pasa a él. Esto hace visible el resultado después de cerrar un formulario y ayuda a quienes usan teclado o lector de pantalla.

Las listas también distinguen entre ausencia de registros y búsquedas sin coincidencias. Si faltan socios o clases para una operación, se explica qué crear primero.

No se muestra una espera artificial: los datos locales se leen y actualizan inmediatamente. Si más adelante se agrega una API, habrá que incorporar sus estados de carga y errores de conexión.

## 16. Persistencia local y restauración

useDatosLocales lee la clave gestor-gym-admin-v1 del localStorage al iniciar. Si no existe o no contiene el formato general esperado, crea datos de ejemplo.

Un useEffect guarda el objeto datos como JSON cada vez que cambia. Si el navegador no permite guardarlo, se comunica el problema y se sigue trabajando en memoria.

Restaurar ejemplos reemplaza las listas y reinicia formularios y filtros después de pedir confirmación. Las reservas iniciales vuelven a pertenecer a la semana actual.

El almacenamiento depende del navegador y del origen, es decir, protocolo, dominio y puerto. localhost:5173 y 127.0.0.1:5173 son orígenes distintos. Borrar los datos del navegador también borra la demostración.

## 17. Estilos y adaptación

- base.css aplica tipografía, márgenes y box-sizing.
- App.css define menú, encabezados, aviso local, enlace para saltar al contenido y navegación móvil.
- Crud.css define botones, formularios, mensajes y estados vacíos.
- Listados.css define tablas, filtros, tarjetas y reglas compartidas para pantallas pequeñas.
- Socios.css conserva los detalles del listado de socios.
- Agenda.css define el calendario y la versión agrupada por día.

Se reutilizan colores, botones y espacios para mantener consistencia. Los tonos de texto secundarios se oscurecieron para mejorar la legibilidad.

En pantallas pequeñas, el menú se distribuye en dos filas, los formularios pasan a una columna y las tarjetas de resumen se apilan. Las tablas conservan sus columnas dentro de un contenedor con desplazamiento horizontal; la página no necesita ensancharse.

Una ayuda visible explica cómo desplazar las tablas. Si una búsqueda no devuelve filas, el mensaje se ajusta al ancho disponible.

## 18. Semántica y teclado

La estructura usa aside, nav, main, header, section, form, table, caption y encabezados jerárquicos.

Los campos tienen etiquetas, las columnas usan scope=col y los botones de cada fila incluyen nombres accesibles que identifican el registro.

Los controles muestran el foco. Los contenedores de tablas se pueden enfocar para desplazarlos con el teclado.

El primer enlace permite Saltar al contenido. El menú indica la sección actual con aria-current y al navegar lleva el foco al contenido.

Los formularios llevan inicialmente el foco al primer campo. La confirmación de eliminación usa el diálogo nativo del navegador, que se puede aceptar o cancelar con teclado.

No hay imágenes decorativas que necesiten un texto alternativo: la marca y los avatares usan letras, y las partes redundantes se ocultan con aria-hidden.

## 19. Relación con la rúbrica

| Criterio | Implementación para demostrar |
| --- | --- |
| Modelo de negocios | Seis módulos pertinentes y relaciones entre socios, planes, clases, reservas y pagos. |
| Estructura | Menú estable, pantallas separadas y componentes compartidos. |
| Semántica y accesibilidad | Etiquetas, tablas con encabezados, foco visible, mensajes anunciados y navegación por teclado. |
| Diseño y usabilidad | Jerarquía visual consistente, acciones principales visibles y mensajes comprensibles. |
| Adaptabilidad | Menú móvil, formularios de una columna, resúmenes apilados y Agenda por día. |
| Interacción | Altas, cambios, bajas, filtros, navegación semanal y resultados compartidos entre módulos. |
| Formularios y estados | Validaciones HTML y de negocio, confirmaciones, éxito, error y ausencia de resultados. |
| Calidad técnica | Modularización, funciones pequeñas, comentarios y pruebas sin dependencias nuevas. |

Esta relación ayuda a preparar la defensa; no es una calificación otorgada por la cátedra. La rúbrica permite datos locales y no exige comunicación con el backend.

## 20. Comandos de ejecución y verificación

Desde la carpeta principal del repositorio:

```powershell
npm --prefix .\frontend install
npm --prefix .\frontend run dev
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

install se necesita la primera vez o cuando faltan dependencias. dev inicia Vite. test ejecuta quince casos de prueba de las reglas de negocio y del cliente. build genera frontend/dist.

Las pruebas cubren datos iniciales coherentes, DNI y correo duplicados, fechas y relaciones inválidas, montos, cupos, reservas duplicadas, socio inactivo, día incorrecto y control de cupo por fecha.

## 21. Recorrido sugerido para presentar

1. Restaurar los ejemplos y mostrar Agenda con turnos disponibles, pocos lugares y uno completo.
2. Navegar entre semanas y volver a Hoy.
3. Crear un plan y asignarlo a un socio nuevo.
4. Buscar al socio por nombre o DNI y usar el filtro de estado.
5. Intentar repetir su DNI para mostrar la validación.
6. Crear una clase y comprobar que aparece en Agenda.
7. Registrar una reserva válida para esa clase y ver cambiar el cupo.
8. Intentar una reserva duplicada o para un socio inactivo y mostrar el mensaje.
9. Editar o cancelar una reserva y revisar la disponibilidad.
10. Registrar un pago, filtrarlo y comprobar la suma de los resultados.
11. Editar el pago y mostrar la confirmación de eliminación.
12. Intentar borrar un plan asignado y explicar la protección de datos relacionados.
13. Recargar para mostrar que los cambios se conservan.
14. Mostrar el menú, un formulario y la Agenda en una pantalla pequeña.
15. Recorrer una parte con Tab y demostrar el foco visible.

Antes de la entrega conviene ejecutar test y build y hacer este recorrido en el equipo donde se va a presentar.

## 22. Vista del cliente y siguiente etapa

La vista React del cliente ya incluye clases disponibles, confirmación de reserva, mis reservas, historial y perfil con plan y pagos. Su diseño sigue el mockup HTML existente. Los archivos y el flujo de datos están explicados en [GUIA_CLIENTE.md](GUIA_CLIENTE.md).

**Políticas de privacidad:** están disponibles desde el pie de ambas vistas y desde Perfil. La pantalla compartida está en modules/privacidad y recibe onVolver y un texto opcional para ese botón. Si más adelante se incorpora un registro de cuentas, también deberá ofrecer acceso a la política.

El aviso actual describe la demostración local: qué información ingresan los formularios, su finalidad, el guardado en localStorage, la conservación de registros, cómo reemplazarlos o borrar el almacenamiento y un enlace oficial sobre derechos en la AAIP. No inventa un responsable ni un correo de contacto del gimnasio; esos datos deben completarse antes de usar información de personas reales.

La integración con el backend vendrá después. El modelo local usa planId, socioId y claseId; la API actual recibe relaciones como { id: ... }, por lo que habrá que convertirlas al enviar y recibir datos.

También habrá que reemplazar la persistencia local por peticiones HTTP, manejar sus estados de carga y errores, y definir el inicio de sesión y los permisos cuando se aborde esa parte del sistema.

vite.config.js conserva el proxy /api, pero actualmente ningún módulo realiza peticiones al backend.
