# Gestor de Gimnasio — API REST (Etapa 1)

Back-end en Java + Spring Boot + JPA + MySQL.

## Cómo ejecutar
1. Iniciar MySQL desde XAMPP (`localhost:3306`; las credenciales están en `application.properties`).
2. (Opcional) Importar `database/gimnasio_db.sql` para crear las tablas y cargar datos de ejemplo.
3. Correr `mvnw spring-boot:run` (o `GestorGimnasioApplication` desde el IDE).
   Si no se importó el script, la base `gimnasio_db` y sus tablas se crean solas.
4. Probar los endpoints con pedidos propios en Postman.

Si la base ya existía antes de quitar la relación entre planes y clases, ejecutar una vez
`database/migracion_planes_sin_clases.sql`. Este script solo elimina la tabla intermedia
`plan_clase`; al iniciar la aplicación, Hibernate agrega la columna opcional `beneficios`.

## Capas
`controller` (recibe HTTP) → `service` (lógica de negocio) → `repository` (base de datos) → `model` (entidades/tablas)

## Entidades y relaciones
| Relación | Tipo | Anotación |
|---|---|---|
| Socio → Plan | N a 1 | `@ManyToOne` |
| Reserva → Socio | N a 1 | `@ManyToOne` |
| Reserva → Clase | N a 1 | `@ManyToOne` |
| Pago → Socio | N a 1 | `@ManyToOne` |

Los planes tienen nombre, precio y una descripción opcional de beneficios. No restringen
las clases disponibles para reservar.

## Endpoints
Cada entidad (`planes`, `clases`, `socios`, `reservas`, `pagos`) tiene el CRUD completo:

| Método | Ruta | Qué hace | Respuesta |
|---|---|---|---|
| GET | `/api/{entidad}` | Lista todos | 200 |
| GET | `/api/{entidad}/{id}` | Busca uno | 200 / 404 |
| POST | `/api/{entidad}` | Crea | 201 / 400 |
| PATCH | `/api/{entidad}/{id}` | Modifica solo los campos enviados | 200 / 400 / 404 / 409 |
| DELETE | `/api/{entidad}/{id}` | Borra | 204 / 404 / 409 |

Endpoints extra:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/socios/filtro?activo=true` | Filtra socios por estado |

## Ejemplos de JSON
Las relaciones se envían con el id del objeto relacionado:
```json
POST /api/socios
{ "dni": "40123456", "nombre": "Juan", "apellido": "Pérez",
  "email": "juan@mail.com", "plan": { "id": 1 } }

POST /api/reservas
{ "socio": { "id": 1 }, "clase": { "id": 1 }, "fecha": "2026-10-05" }

POST /api/pagos
{ "socio": { "id": 1 }, "monto": 35000, "metodoPago": "Transferencia" }

POST /api/planes
{ "nombre": "Plan Full", "precio": 35000, "beneficios": "10% de descuento en bebidas" }

PATCH /api/socios/1
{ "nombre": "Ana" }

PATCH /api/socios/1
{ "activo": false }

PATCH /api/planes/1
{ "precio": 42000 }

PATCH /api/reservas/1
{ "clase": { "id": 2 } }
```

En `PATCH`, los campos omitidos conservan su valor. Se puede enviar `null` para borrar
`telefono`, `fechaNacimiento`, `fechaIngreso` o `plan` de un socio; los campos obligatorios
no aceptan `null`. El `id` no se modifica. En los planes, `beneficios` se puede cambiar
o borrar con `null` mediante `PATCH`. Para probarlo en Postman, usar método `PATCH`,
`Content-Type: application/json` y un cuerpo `raw` JSON.

## Reglas de negocio
- Un socio nuevo empieza activo y, si no se envía fecha de ingreso, se usa la de hoy.
- Un socio inactivo no puede reservar (409).
- Cualquier socio activo puede reservar cualquier clase, sin importar su plan.
- Una clase no acepta más reservas que su cupo para una misma fecha (409).
- Si un pago no trae fecha, se registra con la de hoy.
- Una clase con reservas no se puede eliminar: la API responde 409 indicando cuántas reservas la usan.
- Un plan con socios asignados, o un socio con reservas o pagos, no se puede eliminar;
  la API responde 409 con el motivo concreto.

## Errores
| Código | Cuándo |
|---|---|
| 400 | Faltan datos o son inválidos |
| 404 | El id no existe |
| 409 | Se rompe una regla de negocio o hay datos relacionados (ej.: borrar un plan con socios) |
