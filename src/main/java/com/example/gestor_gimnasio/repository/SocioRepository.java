package com.example.gestor_gimnasio.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestor_gimnasio.model.Socio;

// Al extender JpaRepository, Spring genera automáticamente los métodos
// findAll, findById, save, deleteById y existsById (no hace falta escribir SQL).
public interface SocioRepository extends JpaRepository<Socio, Long> {

    // Spring arma la consulta a partir del nombre del método:
    // SELECT * FROM socios WHERE activo = ?
    List<Socio> findByActivo(Boolean activo);
}
