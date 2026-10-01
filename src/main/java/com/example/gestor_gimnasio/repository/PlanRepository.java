package com.example.gestor_gimnasio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Plan;

// Al extender JpaRepository, Spring genera automáticamente los métodos
// findAll, findById, save, deleteById y existsById (no hace falta escribir SQL).
public interface PlanRepository extends JpaRepository<Plan, Long> {
}
