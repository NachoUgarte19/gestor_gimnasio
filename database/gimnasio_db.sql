-- =============================================================
--  GESTOR DE GIMNASIO - Base de datos (Etapa 1)
--  Motor: MySQL / MariaDB (XAMPP)
--
--  Crea la base "gimnasio_db", sus 5 tablas y datos de ejemplo.
--  ATENCIÓN: borra las tablas si ya existen (se pierden los datos cargados).
-- =============================================================

CREATE DATABASE IF NOT EXISTS gimnasio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gimnasio_db;

-- Se borran en orden inverso para no romper las claves foráneas
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS socios;
DROP TABLE IF EXISTS plan_clase;
DROP TABLE IF EXISTS clases;
DROP TABLE IF EXISTS planes;


-- =============================================================
--  TABLAS
-- =============================================================

-- Entidad Plan. Los beneficios son descriptivos y no limitan las reservas.
CREATE TABLE planes (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    precio      DOUBLE       NOT NULL,
    beneficios  VARCHAR(500),
    PRIMARY KEY (id)
) ENGINE = InnoDB;

-- Entidad Clase
CREATE TABLE clases (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    instructor  VARCHAR(100) NOT NULL,
    dia         VARCHAR(20)  NOT NULL,
    horario     VARCHAR(5)   NOT NULL,
    cupo        INT          NOT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

-- Entidad Socio. Relación N a 1 con Plan (@ManyToOne) mediante plan_id
CREATE TABLE socios (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    dni               VARCHAR(20)  NOT NULL,
    nombre            VARCHAR(100) NOT NULL,
    apellido          VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL,
    telefono          VARCHAR(30),
    fecha_nacimiento  DATE,
    fecha_ingreso     DATE,
    plan_id           BIGINT,
    activo            BIT(1)       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_socios_dni   UNIQUE (dni),
    CONSTRAINT uk_socios_email UNIQUE (email),
    CONSTRAINT fk_socios_plan  FOREIGN KEY (plan_id) REFERENCES planes (id)
) ENGINE = InnoDB;

-- Entidad Reserva. Relación N a 1 con Socio y N a 1 con Clase
CREATE TABLE reservas (
    id        BIGINT NOT NULL AUTO_INCREMENT,
    socio_id  BIGINT NOT NULL,
    clase_id  BIGINT NOT NULL,
    fecha     DATE   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_reservas_socio FOREIGN KEY (socio_id) REFERENCES socios (id),
    CONSTRAINT fk_reservas_clase FOREIGN KEY (clase_id) REFERENCES clases (id)
) ENGINE = InnoDB;

-- Entidad Pago. Relación N a 1 con Socio
CREATE TABLE pagos (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    socio_id     BIGINT      NOT NULL,
    monto        DOUBLE      NOT NULL,
    fecha        DATE        NOT NULL,
    metodo_pago  VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pagos_socio FOREIGN KEY (socio_id) REFERENCES socios (id)
) ENGINE = InnoDB;


-- =============================================================
--  DATOS DE EJEMPLO
-- =============================================================

INSERT INTO planes (id, nombre, precio, beneficios) VALUES
    (1, 'Plan Básico',      25000, NULL),
    (2, 'Plan Full',        35000, '10% de descuento en bebidas'),
    (3, 'Plan Estudiante',  20000, NULL);

INSERT INTO clases (id, nombre, instructor, dia, horario, cupo) VALUES
    (1, 'Spinning',   'Laura Gómez',   'Lunes',     '19:00', 20),
    (2, 'Yoga',       'Martín Ruiz',   'Martes',    '09:30', 15),
    (3, 'Funcional',  'Carla Díaz',    'Miércoles', '18:00', 25),
    (4, 'Zumba',      'Diego Sosa',    'Jueves',    '20:00', 30);

INSERT INTO socios (id, dni, nombre, apellido, email, telefono, fecha_nacimiento, fecha_ingreso, plan_id, activo) VALUES
    (1, '38111222', 'Lucía',   'Fernández', 'lucia.fernandez@mail.com', '1150001111', '1995-03-12', '2026-03-01', 2, 1),
    (2, '41222333', 'Tomás',   'García',    'tomas.garcia@mail.com',    '1150002222', '1999-07-25', '2026-04-15', 1, 1),
    (3, '44333444', 'Sofía',   'López',     'sofia.lopez@mail.com',     '1150003333', '2003-11-08', '2026-05-10', 3, 1),
    (4, '36444555', 'Martín',  'Pereyra',   'martin.pereyra@mail.com',  '1150004444', '1991-01-30', '2026-02-20', 2, 1),
    (5, '40555666', 'Valeria', 'Romero',    'valeria.romero@mail.com',  '1150005555', '1997-09-17', '2026-01-05', 1, 0);  -- inactiva

INSERT INTO reservas (id, socio_id, clase_id, fecha) VALUES
    (1, 1, 1, '2026-10-05'),   -- Lucía   → Spinning
    (2, 1, 2, '2026-10-06'),   -- Lucía   → Yoga
    (3, 2, 3, '2026-10-07'),   -- Tomás   → Funcional
    (4, 3, 2, '2026-10-06'),   -- Sofía   → Yoga
    (5, 4, 4, '2026-10-08');   -- Martín  → Zumba

INSERT INTO pagos (id, socio_id, monto, fecha, metodo_pago) VALUES
    (1, 1, 35000, '2026-09-01', 'Transferencia'),
    (2, 2, 25000, '2026-09-03', 'Efectivo'),
    (3, 3, 20000, '2026-09-05', 'Tarjeta'),
    (4, 4, 35000, '2026-09-02', 'Transferencia'),
    (5, 1, 35000, '2026-08-01', 'Transferencia');
