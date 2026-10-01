package com.example.gestor_gimnasio.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Plan;
import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.repository.PlanRepository;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class SocioService {

    private final SocioRepository socioRepository;
    private final PlanRepository planRepository;

    // Inyección de dependencia: Spring crea los repositories y se los entrega al service automáticamente
    public SocioService(SocioRepository socioRepository, PlanRepository planRepository) {
        this.socioRepository = socioRepository;
        this.planRepository = planRepository;
    }

    public List<Socio> findAll() {
        return socioRepository.findAll();
    }

    public List<Socio> findByActivo(Boolean activo) {
        return socioRepository.findByActivo(activo);
    }

    public Optional<Socio> findById(Long id) {
        // Optional representa un resultado que puede contener un socio o estar vacío.
        return socioRepository.findById(id);
    }

    public Socio save(Socio socio) {
        // Todo socio nuevo empieza habilitado
        socio.setActivo(true);

        // Si no se informa la fecha de ingreso, se usa la de hoy
        if (socio.getFechaIngreso() == null) {
            socio.setFechaIngreso(LocalDate.now());
        }

        // El JSON trae "plan": { "id": 1 }. Buscamos el plan completo en la base.
        socio.setPlan(buscarPlan(socio.getPlan()));

        return socioRepository.save(socio);
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
        socio.setPlan(buscarPlan(datosNuevos.getPlan()));

        // save actualiza porque socio ya tiene un ID existente
        return Optional.of(socioRepository.save(socio));
    }

    // Modificación parcial: solo cambia el estado (baja / alta lógica)
    public Optional<Socio> changeStatus(Long id, boolean activo) {
        Optional<Socio> socioEncontrado = socioRepository.findById(id);

        if (socioEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Socio socio = socioEncontrado.get();
        socio.setActivo(activo);

        return Optional.of(socioRepository.save(socio));
    }

    public boolean deleteById(Long id) {
        // Primero verificamos si el socio existe
        if (!socioRepository.existsById(id)) {
            return false;
        }
        socioRepository.deleteById(id);
        return true;
    }

    // El plan es opcional. Si viene, tiene que existir.
    private Plan buscarPlan(Plan plan) {
        if (plan == null || plan.getId() == null) {
            return null;
        }
        return planRepository.findById(plan.getId())
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado"));
    }
}
