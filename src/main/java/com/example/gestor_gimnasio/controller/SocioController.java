package com.example.gestor_gimnasio.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

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
    public Socio getSocioById(@PathVariable Long id) {
        return socioService.findById(id);
    }

    @PostMapping()
    public Socio createSocio(@RequestBody Socio socio) {
        return socioService.save(socio);
    }
}