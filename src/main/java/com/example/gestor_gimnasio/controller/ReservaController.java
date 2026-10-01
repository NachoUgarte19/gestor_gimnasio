package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestor_gimnasio.model.Reserva;
import com.example.gestor_gimnasio.service.ReservaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    // GET http://localhost:8080/api/reservas  → lista todos
    @GetMapping
    public List<Reserva> getAll() {
        return reservaService.findAll();
    }

    // GET http://localhost:8080/api/reservas/1  → 200 con el registro o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getById(@PathVariable Long id) {
        Optional<Reserva> encontrado = reservaService.findById(id);

        if (encontrado.isPresent()) {
            return ResponseEntity.ok(encontrado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/api/reservas  → 201 Created
    // @Valid revisa las anotaciones de validación de la entidad (@NotBlank, @NotNull...)
    @PostMapping
    public ResponseEntity<Reserva> create(@Valid @RequestBody Reserva reserva) {
        Reserva creado = reservaService.save(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT http://localhost:8080/api/reservas/1  → reemplaza todos los datos
    @PutMapping("/{id}")
    public ResponseEntity<Reserva> update(@PathVariable Long id, @Valid @RequestBody Reserva datosNuevos) {
        Optional<Reserva> actualizado = reservaService.update(id, datosNuevos);

        if (actualizado.isPresent()) {
            return ResponseEntity.ok(actualizado.get());
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/api/reservas/1  → 204 No Content o 404
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (reservaService.deleteById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
