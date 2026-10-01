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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Data;

@Data
@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELACIÓN N a 1: un socio hace muchos pagos
    @NotNull(message = "El socio es obligatorio")
    @ManyToOne
    @JoinColumn(name = "socio_id", nullable = false)
    private Socio socio;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    @Column(nullable = false)
    private Double monto;

    // Si no se envía, el service pone la fecha de hoy
    @Column(nullable = false)
    private LocalDate fecha;

    // Ej: "Efectivo", "Transferencia", "Tarjeta"
    @NotBlank(message = "El método de pago es obligatorio")
    @Column(name = "metodo_pago", nullable = false, length = 30)
    private String metodoPago;
}
