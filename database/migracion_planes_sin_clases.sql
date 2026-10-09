-- Ejecutar una sola vez sobre una base ya existente.
-- Elimina únicamente la antigua relación Plan-Clase.
-- Los planes, socios, clases, reservas y pagos se conservan.
-- Al iniciar la aplicación, Hibernate agrega la columna opcional beneficios.

USE gimnasio_db;

DROP TABLE IF EXISTS plan_clase;
