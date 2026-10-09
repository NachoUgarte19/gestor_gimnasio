package com.example.gestor_gimnasio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Pago;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    boolean existsBySocioId(Long socioId);
}
