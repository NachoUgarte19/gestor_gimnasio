package com.example.gestor_gimnasio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Plan;

public interface PlanRepository extends JpaRepository<Plan, Long> {
}
