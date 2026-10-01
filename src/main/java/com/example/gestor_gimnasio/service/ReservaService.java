package com.example.gestor_gimnasio.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

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

    public ReservaService(ReservaRepository reservaRepository,
                          SocioRepository socioRepository,
                          ClaseRepository claseRepository) {
        this.reservaRepository = reservaRepository;
        this.socioRepository = socioRepository;
        this.claseRepository = claseRepository;
    }

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Long id) {
        return reservaRepository.findById(id);
    }

    public Reserva save(Reserva reserva) {
        // El JSON trae "socio": { "id": 1 } y "clase": { "id": 1 }
        Socio socio = buscarSocio(reserva.getSocio().getId());
        Clase clase = buscarClase(reserva.getClase().getId());

        // LÓGICA DE NEGOCIO
        // 1. Un socio dado de baja no puede reservar
        if (!socio.getActivo()) {
            throw new IllegalStateException("El socio está inactivo y no puede reservar");
        }

        // 2. La clase no puede superar su cupo en esa fecha
        long reservasDelDia = reservaRepository.countByClaseIdAndFecha(clase.getId(), reserva.getFecha());
        if (reservasDelDia >= clase.getCupo()) {
            throw new IllegalStateException("La clase no tiene cupo disponible para esa fecha");
        }

        reserva.setSocio(socio);
        reserva.setClase(clase);
        return reservaRepository.save(reserva);
    }

    public Optional<Reserva> update(Long id, Reserva datosNuevos) {
        Optional<Reserva> reservaEncontrada = reservaRepository.findById(id);

        if (reservaEncontrada.isEmpty()) {
            return Optional.empty();
        }

        Reserva reserva = reservaEncontrada.get();
        reserva.setSocio(buscarSocio(datosNuevos.getSocio().getId()));
        reserva.setClase(buscarClase(datosNuevos.getClase().getId()));
        reserva.setFecha(datosNuevos.getFecha());

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
        return socioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Socio no encontrado"));
    }

    private Clase buscarClase(Long id) {
        return claseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Clase no encontrada"));
    }
}
