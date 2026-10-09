package com.example.gestor_gimnasio.service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Clase;
import com.example.gestor_gimnasio.model.Plan;
import com.example.gestor_gimnasio.repository.ClaseRepository;
import com.example.gestor_gimnasio.repository.PlanRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PlanService {

    private final PlanRepository planRepository;
    private final ClaseRepository claseRepository;
    private final DatosPatch datosPatch;

    public PlanService(PlanRepository planRepository, ClaseRepository claseRepository, DatosPatch datosPatch) {
        this.planRepository = planRepository;
        this.claseRepository = claseRepository;
        this.datosPatch = datosPatch;
    }

    public List<Plan> findAll() {
        return planRepository.findAll();
    }

    public Optional<Plan> findById(Long id) {
        return planRepository.findById(id);
    }

    public Plan save(Plan plan) {
        // Las clases se agregan después con POST /api/planes/{planId}/clases/{claseId}
        plan.getClases().clear();
        return planRepository.save(plan);
    }

    public Optional<Plan> update(Long id, Plan datosNuevos) {
        Optional<Plan> planEncontrado = planRepository.findById(id);

        if (planEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Plan plan = planEncontrado.get();
        plan.setNombre(datosNuevos.getNombre());
        plan.setPrecio(datosNuevos.getPrecio());
        // No tocamos la lista de clases: se maneja con sus propios endpoints

        return Optional.of(planRepository.save(plan));
    }

    public Optional<Plan> patch(Long id, Map<String, Object> cambios) {
        Optional<Plan> encontrado = planRepository.findById(id);
        if (encontrado.isEmpty()) {
            return Optional.empty();
        }

        datosPatch.validarCampos(cambios, Set.of("nombre", "precio"));
        Plan plan = encontrado.get();
        for (Map.Entry<String, Object> cambio : cambios.entrySet()) {
            String campo = cambio.getKey();
            Object valor = cambio.getValue();
            switch (campo) {
                case "nombre" -> plan.setNombre(datosPatch.texto(valor, campo));
                case "precio" -> plan.setPrecio(datosPatch.decimal(valor, campo));
                default -> throw new IllegalStateException("Campo PATCH sin implementar: " + campo);
            }
        }

        datosPatch.validarEntidad(plan);
        return Optional.of(planRepository.save(plan));
    }

    public boolean deleteById(Long id) {
        if (!planRepository.existsById(id)) {
            return false;
        }
        planRepository.deleteById(id);
        return true;
    }

    // ---------- Relación N a N ----------

    // Agrega una fila en la tabla intermedia plan_clase
    public Plan agregarClase(Long planId, Long claseId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado"));
        Clase clase = claseRepository.findById(claseId)
                .orElseThrow(() -> new NoSuchElementException("Clase no encontrada"));

        if (!plan.getClases().contains(clase)) {
            plan.getClases().add(clase);
        }
        return planRepository.save(plan);
    }

    // Borra la fila de la tabla intermedia plan_clase
    public Plan quitarClase(Long planId, Long claseId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado"));

        plan.getClases().removeIf(clase -> clase.getId().equals(claseId));
        return planRepository.save(plan);
    }
}
