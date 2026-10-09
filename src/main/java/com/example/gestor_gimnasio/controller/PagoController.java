package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestor_gimnasio.model.Pago;
import com.example.gestor_gimnasio.service.PagoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    // GET http://localhost:8080/api/pagos  → lista todos
    @GetMapping
    public List<Pago> getAll() {
        return pagoService.findAll();
    }

    // GET http://localhost:8080/api/pagos/1  → 200 con el registro o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<Pago> getById(@PathVariable Long id) {
        Optional<Pago> encontrado = pagoService.findById(id);

        if (encontrado.isPresent()) {
            return ResponseEntity.ok(encontrado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/api/pagos  → 201 Created
    // @Valid revisa las anotaciones de validación de la entidad (@NotBlank, @NotNull...)
    @PostMapping
    public ResponseEntity<Pago> create(@Valid @RequestBody Pago pago) {
        Pago creado = pagoService.save(pago);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT http://localhost:8080/api/pagos/1  → reemplaza todos los datos
    @PutMapping("/{id}")
    public ResponseEntity<Pago> update(@PathVariable Long id, @Valid @RequestBody Pago datosNuevos) {
        Optional<Pago> actualizado = pagoService.update(id, datosNuevos);

        if (actualizado.isPresent()) {
            return ResponseEntity.ok(actualizado.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Pago> patch(@PathVariable Long id, @RequestBody Map<String, Object> cambios) {
        return pagoService.patch(id, cambios)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE http://localhost:8080/api/pagos/1  → 204 No Content o 404
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (pagoService.deleteById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
