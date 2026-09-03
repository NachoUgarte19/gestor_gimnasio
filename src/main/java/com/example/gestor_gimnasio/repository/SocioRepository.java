package com.example.gestor_gimnasio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Socio;

public interface SocioRepository extends JpaRepository<Socio, Long> {

}