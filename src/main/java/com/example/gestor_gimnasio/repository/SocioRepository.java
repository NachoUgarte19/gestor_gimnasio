package com.example.gestor_gimnasio.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Socio;

public interface SocioRepository extends JpaRepository<Socio, Long> {

    // Spring Data construye automáticamente la consulta
    // utilizando el atributo "activo" de Socio
    List<Socio> findByActivo(Boolean activo);
}