package com.example.gestor_gimnasio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Clase;

public interface ClaseRepository extends JpaRepository<Clase, Long> {
}
