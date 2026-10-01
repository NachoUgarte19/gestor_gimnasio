package com.example.gestor_gimnasio.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Pago;
import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.repository.PagoRepository;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PagoService {

    private final PagoRepository pagoRepository;
    private final SocioRepository socioRepository;

    public PagoService(PagoRepository pagoRepository, SocioRepository socioRepository) {
        this.pagoRepository = pagoRepository;
        this.socioRepository = socioRepository;
    }

    public List<Pago> findAll() {
        return pagoRepository.findAll();
    }

    public Optional<Pago> findById(Long id) {
        return pagoRepository.findById(id);
    }

    public Pago save(Pago pago) {
        // El JSON trae "socio": { "id": 1 }. Buscamos el socio completo.
        pago.setSocio(buscarSocio(pago.getSocio().getId()));

        // Si no se informa la fecha, el pago se registra hoy
        if (pago.getFecha() == null) {
            pago.setFecha(LocalDate.now());
        }

        return pagoRepository.save(pago);
    }

    public Optional<Pago> update(Long id, Pago datosNuevos) {
        Optional<Pago> pagoEncontrado = pagoRepository.findById(id);

        if (pagoEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Pago pago = pagoEncontrado.get();
        pago.setSocio(buscarSocio(datosNuevos.getSocio().getId()));
        pago.setMonto(datosNuevos.getMonto());
        pago.setMetodoPago(datosNuevos.getMetodoPago());
        if (datosNuevos.getFecha() != null) {
            pago.setFecha(datosNuevos.getFecha());
        }

        return Optional.of(pagoRepository.save(pago));
    }

    public boolean deleteById(Long id) {
        if (!pagoRepository.existsById(id)) {
            return false;
        }
        pagoRepository.deleteById(id);
        return true;
    }

    private Socio buscarSocio(Long id) {
        return socioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Socio no encontrado"));
    }
}
