package com.example.gestor_gimnasio.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.service.SocioService;

@RestController
@RequestMapping("api/socios")
public class SocioController {

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    // GET http://localhost:8080/api/socios
    @GetMapping()
    public List<Socio> getAllSocios() {
        return socioService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Socio> getSocioById(@PathVariable Long id) {

        Optional<Socio> socioEncontrado = socioService.findById(id);

        if (socioEncontrado.isPresent()) {
            // 200 OK con el socio dentro del body
            return ResponseEntity.ok(socioEncontrado.get());
        }

        // El ID no corresponde a ningún socio: 404 sin body
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Socio> updateSocio(
            @PathVariable Long id,
            @RequestBody Socio datosNuevos) {

        Optional<Socio> socioActualizado = socioService.update(id, datosNuevos);

        if (socioActualizado.isPresent()) {
            // El socio existía y fue actualizado correctamente
            return ResponseEntity.ok(socioActualizado.get());
        }

        // No existe un socio con ese ID
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSocio(@PathVariable Long id) {

        boolean eliminado = socioService.deleteById(id);

        if (eliminado) {
            // 204 indica que la operación fue exitosa,
            // pero no hay contenido para devolver
            return ResponseEntity.noContent().build();
        }

        // No existe un socio con ese ID
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Socio> changeSocioStatus(
            @PathVariable Long id,
            @RequestParam boolean activo) {

        Optional<Socio> socioActualizado =
                socioService.changeStatus(id, activo);

        if (socioActualizado.isPresent()) {
            return ResponseEntity.ok(socioActualizado.get());
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping()
    public Socio createSocio(@RequestBody Socio socio) {
        return socioService.save(socio);
    }
}