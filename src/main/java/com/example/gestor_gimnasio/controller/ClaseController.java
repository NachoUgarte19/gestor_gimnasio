package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestor_gimnasio.model.Clase;
import com.example.gestor_gimnasio.service.ClaseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clases")
public class ClaseController {

    private final ClaseService claseService;

    public ClaseController(ClaseService claseService) {
        this.claseService = claseService;
    }

    // GET http://localhost:8080/api/clases  → lista todos
    @GetMapping
    public List<Clase> getAll() {
        return claseService.findAll();
    }

    // GET http://localhost:8080/api/clases/1  → 200 con el registro o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<Clase> getById(@PathVariable Long id) {
        Optional<Clase> encontrado = claseService.findById(id);

        if (encontrado.isPresent()) {
            return ResponseEntity.ok(encontrado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/api/clases  → 201 Created
    // @Valid revisa las anotaciones de validación de la entidad (@NotBlank, @NotNull...)
    @PostMapping
    public ResponseEntity<Clase> create(@Valid @RequestBody Clase clase) {
        Clase creado = claseService.save(clase);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT http://localhost:8080/api/clases/1  → reemplaza todos los datos
    @PutMapping("/{id}")
    public ResponseEntity<Clase> update(@PathVariable Long id, @Valid @RequestBody Clase datosNuevos) {
        Optional<Clase> actualizado = claseService.update(id, datosNuevos);

        if (actualizado.isPresent()) {
            return ResponseEntity.ok(actualizado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/api/clases/1  → 204 No Content o 404
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (claseService.deleteById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
