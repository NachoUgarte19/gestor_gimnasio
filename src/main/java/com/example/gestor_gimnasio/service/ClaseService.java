package com.example.gestor_gimnasio.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Clase;
import com.example.gestor_gimnasio.repository.ClaseRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ClaseService {

    private final ClaseRepository claseRepository;

    public ClaseService(ClaseRepository claseRepository) {
        this.claseRepository = claseRepository;
    }

    public List<Clase> findAll() {
        return claseRepository.findAll();
    }

    public Optional<Clase> findById(Long id) {
        return claseRepository.findById(id);
    }

    public Clase save(Clase clase) {
        return claseRepository.save(clase);
    }

    public Optional<Clase> update(Long id, Clase datosNuevos) {
        Optional<Clase> claseEncontrada = claseRepository.findById(id);

        if (claseEncontrada.isEmpty()) {
            return Optional.empty();
        }

        Clase clase = claseEncontrada.get();
        clase.setNombre(datosNuevos.getNombre());
        clase.setInstructor(datosNuevos.getInstructor());
        clase.setDia(datosNuevos.getDia());
        clase.setHorario(datosNuevos.getHorario());
        clase.setCupo(datosNuevos.getCupo());

        return Optional.of(claseRepository.save(clase));
    }

    public boolean deleteById(Long id) {
        if (!claseRepository.existsById(id)) {
            return false;
        }
        claseRepository.deleteById(id);
        return true;
    }
}
