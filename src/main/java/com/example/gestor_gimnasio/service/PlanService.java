package com.example.gestor_gimnasio.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Plan;
import com.example.gestor_gimnasio.repository.PlanRepository;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PlanService {

    private final PlanRepository planRepository;
    private final SocioRepository socioRepository;
    private final DatosPatch datosPatch;

    public PlanService(PlanRepository planRepository, SocioRepository socioRepository, DatosPatch datosPatch) {
        this.planRepository = planRepository;
        this.socioRepository = socioRepository;
        this.datosPatch = datosPatch;
    }

    public List<Plan> findAll() {
        return planRepository.findAll();
    }

    public Optional<Plan> findById(Long id) {
        return planRepository.findById(id);
    }

    public Plan save(Plan plan) {
        return planRepository.save(plan);
    }

    public Optional<Plan> patch(Long id, Map<String, Object> cambios) {
        Optional<Plan> encontrado = planRepository.findById(id);
        if (encontrado.isEmpty()) {
            return Optional.empty();
        }

        datosPatch.validarCampos(cambios, Set.of("nombre", "precio", "beneficios"));
        Plan plan = encontrado.get();
        for (Map.Entry<String, Object> cambio : cambios.entrySet()) {
            String campo = cambio.getKey();
            Object valor = cambio.getValue();
            switch (campo) {
                case "nombre" -> plan.setNombre(datosPatch.texto(valor, campo));
                case "precio" -> plan.setPrecio(datosPatch.decimal(valor, campo));
                case "beneficios" -> plan.setBeneficios(datosPatch.texto(valor, campo));
                default -> throw new IllegalStateException("Campo PATCH sin implementar: " + campo);
            }
        }

        datosPatch.validarEntidad(plan);
        return Optional.of(planRepository.save(plan));
    }

    public boolean deleteById(Long id) {
        Optional<Plan> encontrado = planRepository.findById(id);
        if (encontrado.isEmpty()) {
            return false;
        }
        // Primero hay que reasignar a los socios que todavía usan este plan.
        if (socioRepository.existsByPlanId(id)) {
            throw new IllegalStateException("No se puede eliminar el plan porque tiene socios asignados");
        }

        planRepository.delete(encontrado.get());
        return true;
    }
}
