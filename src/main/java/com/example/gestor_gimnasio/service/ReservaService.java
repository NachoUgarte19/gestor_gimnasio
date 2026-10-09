package com.example.gestor_gimnasio.service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Clase;
import com.example.gestor_gimnasio.model.Reserva;
import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.repository.ClaseRepository;
import com.example.gestor_gimnasio.repository.ReservaRepository;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final SocioRepository socioRepository;
    private final ClaseRepository claseRepository;
    private final DatosPatch datosPatch;

    public ReservaService(ReservaRepository reservaRepository, SocioRepository socioRepository, ClaseRepository claseRepository, DatosPatch datosPatch) {
        this.reservaRepository = reservaRepository;
        this.socioRepository = socioRepository;
        this.claseRepository = claseRepository;
        this.datosPatch = datosPatch;
    }

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Long id) {
        return reservaRepository.findById(id);
    }

    public Reserva save(Reserva reserva) {
        Socio socio = buscarSocio(reserva.getSocio().getId());
        Clase clase = buscarClase(reserva.getClase().getId());

        // El plan del socio no limita las clases que puede reservar.
        if (!socio.getActivo()) {
            throw new IllegalStateException("El socio está inactivo y no puede reservar");
        }

        // El cupo se controla para la fecha concreta, no para toda la clase semanal.
        long reservasDelDia = reservaRepository.countByClaseIdAndFecha(clase.getId(), reserva.getFecha());
        if (reservasDelDia >= clase.getCupo()) {
            throw new IllegalStateException("La clase no tiene cupo disponible para esa fecha");
        }

        reserva.setSocio(socio);
        reserva.setClase(clase);
        return reservaRepository.save(reserva);
    }

    public Optional<Reserva> patch(Long id, Map<String, Object> cambios) {
        Optional<Reserva> encontrada = reservaRepository.findById(id);
        if (encontrada.isEmpty()) {
            return Optional.empty();
        }

        datosPatch.validarCampos(cambios, Set.of("socio", "clase", "fecha"));
        Reserva reserva = encontrada.get();
        Long claseAnteriorId = reserva.getClase().getId();
        java.time.LocalDate fechaAnterior = reserva.getFecha();
        for (Map.Entry<String, Object> cambio : cambios.entrySet()) {
            String campo = cambio.getKey();
            Object valor = cambio.getValue();
            switch (campo) {
                case "socio" -> reserva.setSocio(buscarSocio(datosPatch.idRelacion(valor, campo)));
                case "clase" -> reserva.setClase(buscarClase(datosPatch.idRelacion(valor, campo)));
                case "fecha" -> reserva.setFecha(datosPatch.fecha(valor, campo));
                default -> throw new IllegalStateException("Campo PATCH sin implementar: " + campo);
            }
        }

        datosPatch.validarEntidad(reserva);
        if (!reserva.getSocio().getActivo()) {
            throw new IllegalStateException("El socio está inactivo y no puede reservar");
        }
        // La reserva actual ya ocupa un lugar: solo comprobamos cupo si cambia de clase o fecha.
        boolean mismoTurno = Objects.equals(claseAnteriorId, reserva.getClase().getId()) && Objects.equals(fechaAnterior, reserva.getFecha());
        if (!mismoTurno) {
            long reservasDelDia = reservaRepository.countByClaseIdAndFecha(reserva.getClase().getId(), reserva.getFecha());
            if (reservasDelDia >= reserva.getClase().getCupo()) {
                throw new IllegalStateException("La clase no tiene cupo disponible para esa fecha");
            }
        }

        return Optional.of(reservaRepository.save(reserva));
    }

    public boolean deleteById(Long id) {
        if (!reservaRepository.existsById(id)) {
            return false;
        }
        reservaRepository.deleteById(id);
        return true;
    }

    private Socio buscarSocio(Long id) {
        return socioRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Socio no encontrado"));
    }

    private Clase buscarClase(Long id) {
        return claseRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Clase no encontrada"));
    }
}
