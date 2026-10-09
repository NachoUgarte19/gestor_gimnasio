package com.example.gestor_gimnasio.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.exception.PatchInvalidoException;
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
    private final DatosPatch datosPatch;

    public PagoService(PagoRepository pagoRepository, SocioRepository socioRepository, DatosPatch datosPatch) {
        this.pagoRepository = pagoRepository;
        this.socioRepository = socioRepository;
        this.datosPatch = datosPatch;
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

    public Optional<Pago> patch(Long id, Map<String, Object> cambios) {
        Optional<Pago> encontrado = pagoRepository.findById(id);
        if (encontrado.isEmpty()) {
            return Optional.empty();
        }

        datosPatch.validarCampos(cambios, Set.of("socio", "monto", "fecha", "metodoPago"));
        Pago pago = encontrado.get();
        for (Map.Entry<String, Object> cambio : cambios.entrySet()) {
            String campo = cambio.getKey();
            Object valor = cambio.getValue();
            switch (campo) {
                case "socio" -> pago.setSocio(buscarSocio(datosPatch.idRelacion(valor, campo)));
                case "monto" -> pago.setMonto(datosPatch.decimal(valor, campo));
                case "fecha" -> {
                    if (valor == null) {
                        throw new PatchInvalidoException("La fecha del pago es obligatoria");
                    }
                    pago.setFecha(datosPatch.fecha(valor, campo));
                }
                case "metodoPago" -> pago.setMetodoPago(datosPatch.texto(valor, campo));
                default -> throw new IllegalStateException("Campo PATCH sin implementar: " + campo);
            }
        }

        datosPatch.validarEntidad(pago);
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
