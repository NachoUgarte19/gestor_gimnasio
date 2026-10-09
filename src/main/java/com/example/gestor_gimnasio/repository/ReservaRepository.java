package com.example.gestor_gimnasio.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Reserva;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    long countByClaseIdAndFecha(Long claseId, LocalDate fecha);

    long countByClaseId(Long claseId);

    boolean existsBySocioId(Long socioId);

    List<Reserva> findByClaseId(Long claseId);
}
