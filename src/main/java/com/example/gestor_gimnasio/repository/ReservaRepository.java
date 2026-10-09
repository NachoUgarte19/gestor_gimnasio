package com.example.gestor_gimnasio.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Reserva;

// Al extender JpaRepository, Spring genera automáticamente los métodos
// findAll, findById, save, deleteById y existsById (no hace falta escribir SQL).
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // SELECT COUNT(*) FROM reservas WHERE clase_id = ? AND fecha = ?
    // Se usa para controlar el cupo de la clase.
    long countByClaseIdAndFecha(Long claseId, LocalDate fecha);

    List<Reserva> findByClaseId(Long claseId);
}
