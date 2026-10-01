package com.example.gestor_gimnasio.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELACIÓN N a 1: un socio puede tener muchas reservas
    @NotNull(message = "El socio es obligatorio")
    @ManyToOne
    @JoinColumn(name = "socio_id", nullable = false)
    private Socio socio;

    // RELACIÓN N a 1: una clase puede tener muchas reservas
    @NotNull(message = "La clase es obligatoria")
    @ManyToOne
    @JoinColumn(name = "clase_id", nullable = false)
    private Clase clase;

    // Día al que el socio va a asistir. Formato JSON: "2026-10-05"
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDate fecha;
}
