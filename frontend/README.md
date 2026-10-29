# Frontend del gimnasio

Pantallas de Agenda, Socios, Clases, Planes y Pagos hechas con React, Vite y CSS. La **Agenda** lee clases y reservas del backend. Las demás pantallas siguen usando datos de ejemplo.

## Ejecutar

Para usar la Agenda, primero iniciá MySQL y el backend desde la carpeta principal:

```bash
.\mvnw.cmd spring-boot:run
```

En otra terminal, desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

Abrir la dirección que muestre Vite (normalmente http://localhost:5173).

Vite reenvía las llamadas `/api` a `http://localhost:8080`. La Agenda consulta `GET /api/clases` y `GET /api/reservas` al abrir la página. Si la base está vacía, podés importar `database/gimnasio_db.sql` para cargar ejemplos. Las reservas del script tienen fechas concretas: movete a esa semana para ver su efecto en los cupos. Para leer cambios hechos después de abrir la página, recargala.

Si la terminal está en la carpeta principal del proyecto, también se puede usar `npm --prefix .\frontend run dev`.

## Mockups de la vista del socio

Abrir `../docs/mockups/06-vista-socio.html` con doble clic en el navegador. El archivo muestra cuatro pantallas móviles: clases disponibles, confirmación de reserva, mis reservas y perfil. Está junto a los cinco mockups de recepción en `docs/mockups` y también se incluye en `docs/mockups-gimnasio.zip`. No requiere instalar dependencias ni iniciar el backend.

## Cómo leer el código

1. `src/main.jsx` coloca `App` en la página.
2. `src/App.jsx` dibuja el menú y elige qué módulo se muestra. `src/App.css` tiene los estilos del menú y del encabezado.
3. Cada carpeta dentro de `src/modules` contiene una pantalla:
   - `agenda/Agenda.jsx` y `agenda/Agenda.css`: calendario semanal.
   - `socios/Socios.jsx` y `socios/Socios.css`: listado de socios.
   - `clases/Clases.jsx`: listado de clases.
   - `planes/Planes.jsx`: listado de planes.
   - `pagos/Pagos.jsx`: listado de pagos.
4. `src/styles/base.css` contiene los estilos generales. `src/styles/Listados.css` se comparte entre Clases, Planes y Pagos. `src/styles/Crud.css` da estilo a los formularios y botones de Socios, Clases y Planes.

En Socios, Clases y Planes, **Nuevo** abre un formulario vacío, **Editar** lo abre con los datos de esa fila y **Eliminar** pide confirmación. Al guardar, el arreglo `lista` del módulo se actualiza con `setLista`. El buscador y los números del resumen también usan ese arreglo.

En Socios, Clases y Planes, estos cambios son solo locales: no se llama a la API y se pierden al recargar la página. Al cambiar entre secciones se conservan mientras la página siga abierta. El listado de Clases todavía usa ejemplos independientes de los datos reales de la Agenda. Pagos sigue siendo un listado de ejemplo.
