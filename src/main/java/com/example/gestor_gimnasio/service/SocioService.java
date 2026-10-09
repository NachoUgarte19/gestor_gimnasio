package com.example.gestor_gimnasio.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.gestor_gimnasio.model.Plan;
import com.example.gestor_gimnasio.model.Socio;
import com.example.gestor_gimnasio.repository.PlanRepository;
import com.example.gestor_gimnasio.repository.PagoRepository;
import com.example.gestor_gimnasio.repository.ReservaRepository;
import com.example.gestor_gimnasio.repository.SocioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class SocioService {

    private final SocioRepository socioRepository;
    private final PlanRepository planRepository;
    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;
    private final DatosPatch datosPatch;

    public SocioService(SocioRepository socioRepository, PlanRepository planRepository,
                        ReservaRepository reservaRepository, PagoRepository pagoRepository,
                        DatosPatch datosPatch) {
        this.socioRepository = socioRepository;
        this.planRepository = planRepository;
        this.reservaRepository = reservaRepository;
        this.pagoRepository = pagoRepository;
        this.datosPatch = datosPatch;
    }

    public List<Socio> findAll() {
        return socioRepository.findAll();
    }

    public List<Socio> findByActivo(Boolean activo) {
        return socioRepository.findByActivo(activo);
    }

    public Optional<Socio> findById(Long id) {
        return socioRepository.findById(id);
    }

    public Socio save(Socio socio) {
        // El alta siempre empieza activa; el estado posterior se cambia con PATCH.
        socio.setActivo(true);

        // Si no se informa la fecha de ingreso, se usa la de hoy
        if (socio.getFechaIngreso() == null) {
            socio.setFechaIngreso(LocalDate.now());
        }

        // El cliente envía solo el id; persistimos una referencia existente.
        socio.setPlan(buscarPlan(socio.getPlan()));

        return socioRepository.save(socio);
    }

    public Optional<Socio> patch(Long id, Map<String, Object> cambios) {
        Optional<Socio> encontrado = socioRepository.findById(id);
        if (encontrado.isEmpty()) {
            return Optional.empty();
        }

        datosPatch.validarCampos(cambios, Set.of("dni", "nombre", "apellido", "email", "telefono",
                "fechaNacimiento", "fechaIngreso", "plan", "activo"));
        Socio socio = encontrado.get();
        for (Map.Entry<String, Object> cambio : cambios.entrySet()) {
            String campo = cambio.getKey();
            Object valor = cambio.getValue();
            switch (campo) {
                case "dni" -> socio.setDni(datosPatch.texto(valor, campo));
                case "nombre" -> socio.setNombre(datosPatch.texto(valor, campo));
                case "apellido" -> socio.setApellido(datosPatch.texto(valor, campo));
                case "email" -> socio.setEmail(datosPatch.texto(valor, campo));
                case "telefono" -> socio.setTelefono(datosPatch.texto(valor, campo));
                case "fechaNacimiento" -> socio.setFechaNacimiento(datosPatch.fecha(valor, campo));
                case "fechaIngreso" -> socio.setFechaIngreso(datosPatch.fecha(valor, campo));
                case "plan" -> socio.setPlan(valor == null ? null : planRepository.findById(datosPatch.idRelacion(valor, campo))
                        .orElseThrow(() -> new NoSuchElementException("Plan no encontrado")));
                case "activo" -> socio.setActivo(datosPatch.booleano(valor, campo));
                default -> throw new IllegalStateException("Campo PATCH sin implementar: " + campo);
            }
        }

        datosPatch.validarEntidad(socio);
        return Optional.of(socioRepository.save(socio));
    }

    public boolean deleteById(Long id) {
        if (!socioRepository.existsById(id)) {
            return false;
        }
        // Las referencias de reservas y pagos impiden borrar físicamente al socio.
        if (reservaRepository.existsBySocioId(id)) {
            throw new IllegalStateException("No se puede eliminar el socio porque tiene reservas registradas");
        }
        if (pagoRepository.existsBySocioId(id)) {
            throw new IllegalStateException("No se puede eliminar el socio porque tiene pagos registrados");
        }
        socioRepository.deleteById(id);
        return true;
    }

    // El plan es opcional. Si viene, tiene que existir.
    private Plan buscarPlan(Plan plan) {
        if (plan == null || plan.getId() == null) {
            return null;
        }
        return planRepository.findById(plan.getId())
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado"));
    }
}
