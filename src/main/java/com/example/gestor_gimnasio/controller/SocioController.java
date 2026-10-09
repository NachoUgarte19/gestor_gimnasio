package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Map;
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

    @GetMapping
    public List<Socio> getAll() {
        return socioService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Socio> getById(@PathVariable Long id) {
        Optional<Socio> encontrado = socioService.findById(id);

        if (encontrado.isPresent()) {
            return ResponseEntity.ok(encontrado.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Socio> create(@Valid @RequestBody Socio socio) {
        Socio creado = socioService.save(socio);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Socio> patch(@PathVariable Long id, @RequestBody Map<String, Object> cambios) {
        return socioService.patch(id, cambios)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (socioService.deleteById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/filtro")
    public List<Socio> getByActivo(@RequestParam Boolean activo) {
        return socioService.findByActivo(activo);
    }

}
