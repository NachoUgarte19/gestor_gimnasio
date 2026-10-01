package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestor_gimnasio.model.Plan;
import com.example.gestor_gimnasio.service.PlanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/planes")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    // GET http://localhost:8080/api/planes  → lista todos
    @GetMapping
    public List<Plan> getAll() {
        return planService.findAll();
    }

    // GET http://localhost:8080/api/planes/1  → 200 con el registro o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<Plan> getById(@PathVariable Long id) {
        Optional<Plan> encontrado = planService.findById(id);

        if (encontrado.isPresent()) {
            return ResponseEntity.ok(encontrado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/api/planes  → 201 Created
    // @Valid revisa las anotaciones de validación de la entidad (@NotBlank, @NotNull...)
    @PostMapping
    public ResponseEntity<Plan> create(@Valid @RequestBody Plan plan) {
        Plan creado = planService.save(plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT http://localhost:8080/api/planes/1  → reemplaza todos los datos
    @PutMapping("/{id}")
    public ResponseEntity<Plan> update(@PathVariable Long id, @Valid @RequestBody Plan datosNuevos) {
        Optional<Plan> actualizado = planService.update(id, datosNuevos);

        if (actualizado.isPresent()) {
            return ResponseEntity.ok(actualizado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/api/planes/1  → 204 No Content o 404
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (planService.deleteById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ---------- Relación N a N entre Plan y Clase ----------

    // POST http://localhost:8080/api/planes/1/clases/2  → agrega la clase 2 al plan 1
    @PostMapping("/{planId}/clases/{claseId}")
    public Plan agregarClase(@PathVariable Long planId, @PathVariable Long claseId) {
        return planService.agregarClase(planId, claseId);
    }

    // DELETE http://localhost:8080/api/planes/1/clases/2  → quita la clase 2 del plan 1
    @DeleteMapping("/{planId}/clases/{claseId}")
    public Plan quitarClase(@PathVariable Long planId, @PathVariable Long claseId) {
        return planService.quitarClase(planId, claseId);
    }
}
