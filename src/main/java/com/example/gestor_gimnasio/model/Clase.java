package com.example.gestor_gimnasio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Data;

@Data
@Entity
@Table(name = "clases")
public class Clase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El instructor es obligatorio")
    @Column(nullable = false, length = 100)
    private String instructor;

    // Define la clase semanal; cada reserva guarda la fecha concreta de asistencia.
    @NotBlank(message = "El día es obligatorio")
    @Column(nullable = false, length = 20)
    private String dia;

    @NotBlank(message = "El horario es obligatorio")
    @Column(nullable = false, length = 5)
    private String horario;

    @NotNull(message = "El cupo es obligatorio")
    @Positive(message = "El cupo debe ser mayor a 0")
    @Column(nullable = false)
    private Integer cupo;
}
