package com.example.gestor_gimnasio.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class SocioService {

    private final SocioRepository socioRepository;

    // inyeccion de dependencia. Spring crea el reposotory y se lo entrega a Service automaticamente
    public SocioService(SocioRepository socioRepository) {
        this.socioRepository = socioRepository;
    }

    public List<Socio> findAll() {
        return socioRepository.findAll();
    }

    public Socio save(Socio socio) {
        return socioRepository.save(socio);
    }

    public Socio findById(Long id) {
        return socioRepository.findById(id).orElse(null);
    }
}