package com.example.gestor_gimnasio.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class SocioService {

    private final SocioRepository socioRepository;

    // inyeccion de dependencia. Spring crea el reposotory y se lo entrega a Service automaticamente
    public SocioService(SocioRepository socioRepository) {
        this.socioRepository = socioRepository;
    }

    public List<Socio> findAll() {
        return socioRepository.findAll();
    }

    public Socio save(Socio socio) {

        // Todo socio nuevo empieza habilitado
        socio.setActivo(true);

        return socioRepository.save(socio);
    }

    public Optional<Socio> changeStatus(Long id, boolean activo) {

        Optional<Socio> socioEncontrado = socioRepository.findById(id);

        if (socioEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Socio socio = socioEncontrado.get();
        socio.setActivo(activo);

        Socio socioActualizado = socioRepository.save(socio);

        return Optional.of(socioActualizado);
    }

    public Optional<Socio> findById(Long id) {
        // Optional representa un resultado que puede contener un socio o estar vacío.
        return socioRepository.findById(id);
    }

    public Optional<Socio> update(Long id, Socio datosNuevos) {

        Optional<Socio> socioEncontrado = socioRepository.findById(id);

        if (socioEncontrado.isEmpty()) {
            // No podemos modificar un socio que no existe
            return Optional.empty();
        }

        Socio socio = socioEncontrado.get();

        // Modificamos el objeto que fue recuperado de la base de datos
        socio.setDni(datosNuevos.getDni());
        socio.setNombre(datosNuevos.getNombre());
        socio.setApellido(datosNuevos.getApellido());
        socio.setEmail(datosNuevos.getEmail());
        socio.setTelefono(datosNuevos.getTelefono());
        socio.setFechaNacimiento(datosNuevos.getFechaNacimiento());
        socio.setFechaIngreso(datosNuevos.getFechaIngreso());
        socio.setPlanId(datosNuevos.getPlanId());

        // save actualiza porque socio ya tiene un ID existente
        Socio socioActualizado = socioRepository.save(socio);

        return Optional.of(socioActualizado);
    }

    public boolean deleteById(Long id) {

        // Primero verificamos si el socio existe
        if (!socioRepository.existsById(id)) {
            return false;
        }

        socioRepository.deleteById(id);
        return true;
    }
}