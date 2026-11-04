# Frontend del gimnasio

Vistas de **administración y cliente** hechas con React, Vite y CSS. Funcionan con datos locales, sin iniciar Java, MySQL ni otra API.

Incluye Agenda, Socios, Clases, Planes, Reservas y Pagos. Los cambios se comparten entre pantallas y se guardan en el navegador mediante localStorage.

La vista del cliente implementa el mockup del socio: clases por día, confirmación de reserva, mis reservas, historial y perfil con plan y pagos. Puede editar sus datos de contacto y cancelar sus próximas reservas. Ambas vistas incluyen **Políticas de privacidad**.

El selector superior permite cambiar entre Administrador y Cliente. Para abrir directamente el cliente, agregá **/#cliente** a la dirección de Vite, por ejemplo http://localhost:5173/#cliente. El selector Socio de ejemplo permite recorrer la cuenta de cada persona sin una autenticación real.

## Ejecutar

Desde la carpeta principal del proyecto:

```powershell
npm --prefix .\frontend install
npm --prefix .\frontend run dev
```

Si las dependencias ya están instaladas, alcanza con el segundo comando. Abrí la dirección que indique Vite, normalmente http://localhost:5173.

## Verificar

Desde la carpeta principal:

```powershell
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

El primer comando prueba las validaciones del gimnasio; el segundo compila la aplicación en frontend/dist.

Hay quince pruebas: nueve de las reglas compartidas y seis de las reglas específicas de la vista del cliente.

## Datos de demostración

- La primera vez se crean ejemplos de las cinco entidades.
- Las reservas de ejemplo incluyen turnos de la semana actual y uno anterior para mostrar el historial.
- Los cambios sobreviven a una recarga en ese navegador y dirección.
- **Restaurar ejemplos** pide confirmación y vuelve al conjunto inicial de la semana actual.
- localhost y 127.0.0.1 tienen almacenamientos distintos. Para ver los mismos cambios, usá siempre la misma dirección.
- Si el navegador bloquea el guardado, aparece una advertencia y la aplicación sigue funcionando en memoria.

El guardado es una comodidad de la demo; no reemplaza una base de datos ni comparte información entre dispositivos.

## Explicación completa

Leé [GUIA_FRONTEND.md](GUIA_FRONTEND.md): explica la estructura, cada pantalla, el flujo de datos, las funciones de React, las validaciones, los estilos, la relación con la rúbrica y un recorrido sugerido para la entrega.

La [guía de la vista del cliente](GUIA_CLIENTE.md) explica los nuevos archivos, las reglas de reserva, la edición del perfil y cómo demostrar el recorrido completo.

## Alcance actual

Ambas vistas están implementadas para la demostración. No hay autenticación ni permisos reales. La integración con el backend queda para una siguiente etapa.

El archivo ../docs/mockups/06-vista-socio.html sigue siendo una referencia visual del lado del socio, no una pantalla integrada a esta aplicación.

vite.config.js conserva el proxy /api para una futura integración, pero las pantallas actuales no hacen peticiones al servidor.
