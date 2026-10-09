package com.example.gestor_gimnasio.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Clase;
import com.example.gestor_gimnasio.repository.ClaseRepository;
import com.example.gestor_gimnasio.repository.ReservaRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ClaseService {

    private final ClaseRepository claseRepository;
    private final ReservaRepository reservaRepository;
    private final DatosPatch datosPatch;

    public ClaseService(ClaseRepository claseRepository, ReservaRepository reservaRepository, DatosPatch datosPatch) {
        this.claseRepository = claseRepository;
        this.reservaRepository = reservaRepository;
        this.datosPatch = datosPatch;
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

    public Optional<Clase> patch(Long id, Map<String, Object> cambios) {
        Optional<Clase> encontrada = claseRepository.findById(id);
        if (encontrada.isEmpty()) {
            return Optional.empty();
        }

        datosPatch.validarCampos(cambios, Set.of("nombre", "instructor", "dia", "horario", "cupo"));
        Clase clase = encontrada.get();
        for (Map.Entry<String, Object> cambio : cambios.entrySet()) {
            String campo = cambio.getKey();
            Object valor = cambio.getValue();
            switch (campo) {
                case "nombre" -> clase.setNombre(datosPatch.texto(valor, campo));
                case "instructor" -> clase.setInstructor(datosPatch.texto(valor, campo));
                case "dia" -> clase.setDia(datosPatch.texto(valor, campo));
                case "horario" -> clase.setHorario(datosPatch.texto(valor, campo));
                case "cupo" -> clase.setCupo(datosPatch.entero(valor, campo));
                default -> throw new IllegalStateException("Campo PATCH sin implementar: " + campo);
            }
        }

        datosPatch.validarEntidad(clase);
        if (cambios.containsKey("cupo")) {
            Map<LocalDate, Long> reservasPorFecha = reservaRepository.findByClaseId(id).stream()
                    .collect(Collectors.groupingBy(reserva -> reserva.getFecha(), Collectors.counting()));
            if (reservasPorFecha.values().stream().anyMatch(cantidad -> cantidad > clase.getCupo())) {
                throw new IllegalStateException("El cupo no puede ser menor que las reservas existentes");
            }
        }

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
