package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.service.SocioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/socios")
public class SocioController {

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    // GET http://localhost:8080/api/socios  → lista todos
    @GetMapping
    public List<Socio> getAll() {
        return socioService.findAll();
    }

    // GET http://localhost:8080/api/socios/1  → 200 con el registro o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<Socio> getById(@PathVariable Long id) {
        Optional<Socio> encontrado = socioService.findById(id);

        if (encontrado.isPresent()) {
            return ResponseEntity.ok(encontrado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/api/socios  → 201 Created
    // @Valid revisa las anotaciones de validación de la entidad (@NotBlank, @NotNull...)
    @PostMapping
    public ResponseEntity<Socio> create(@Valid @RequestBody Socio socio) {
        Socio creado = socioService.save(socio);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT http://localhost:8080/api/socios/1  → reemplaza todos los datos
    @PutMapping("/{id}")
    public ResponseEntity<Socio> update(@PathVariable Long id, @Valid @RequestBody Socio datosNuevos) {
        Optional<Socio> actualizado = socioService.update(id, datosNuevos);

        if (actualizado.isPresent()) {
            return ResponseEntity.ok(actualizado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/api/socios/1  → 204 No Content o 404
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (socioService.deleteById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET http://localhost:8080/api/socios/filtro?activo=true  → lista solo activos o inactivos
    @GetMapping("/filtro")
    public List<Socio> getByActivo(@RequestParam Boolean activo) {
        return socioService.findByActivo(activo);
    }

    // PATCH http://localhost:8080/api/socios/1/estado?activo=false
    // PATCH = modificación parcial: solo cambia el estado, no todo el socio
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Socio> changeStatus(@PathVariable Long id, @RequestParam boolean activo) {
        Optional<Socio> actualizado = socioService.changeStatus(id, activo);

        if (actualizado.isPresent()) {
            return ResponseEntity.ok(actualizado.get());
        }
        return ResponseEntity.notFound().build();
    }
}
