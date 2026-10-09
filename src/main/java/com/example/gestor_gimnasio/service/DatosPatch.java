package com.example.gestor_gimnasio.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.example.gestor_gimnasio.exception.PatchInvalidoException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;

@Component
public class DatosPatch {

    private final Validator validator;

    public DatosPatch(Validator validator) {
        this.validator = validator;
    }

    public void validarCampos(Map<String, Object> cambios, Set<String> permitidos) {
        if (cambios == null || cambios.isEmpty()) {
            throw new PatchInvalidoException("Se debe enviar al menos un campo para modificar");
        }
        for (String campo : cambios.keySet()) {
            if (!permitidos.contains(campo)) {
                throw new PatchInvalidoException("El campo '" + campo + "' no se puede modificar");
            }
        }
    }

    public String texto(Object valor, String campo) {
        if (valor == null) {
            return null;
        }
        if (valor instanceof String texto) {
            return texto;
        }
        throw tipoInvalido(campo);
    }

    public Double decimal(Object valor, String campo) {
        if (valor == null) {
            return null;
        }
        if (valor instanceof Number numero) {
            double resultado = numero.doubleValue();
            if (Double.isFinite(resultado)) {
                return resultado;
            }
        }
        throw tipoInvalido(campo);
    }

    public Integer entero(Object valor, String campo) {
        if (valor == null) {
            return null;
        }
        if (valor instanceof Number numero) {
            try {
                return new BigDecimal(numero.toString()).intValueExact();
            } catch (ArithmeticException | NumberFormatException ex) {
                // El número tiene decimales o está fuera del rango de Integer.
            }
        }
        throw tipoInvalido(campo);
    }

    public LocalDate fecha(Object valor, String campo) {
        if (valor == null) {
            return null;
        }
        if (valor instanceof String texto) {
            try {
                return LocalDate.parse(texto);
            } catch (DateTimeParseException ex) {
                throw new PatchInvalidoException("El campo '" + campo + "' debe tener formato AAAA-MM-DD");
            }
        }
        throw tipoInvalido(campo);
    }

    public Boolean booleano(Object valor, String campo) {
        if (valor instanceof Boolean resultado) {
            return resultado;
        }
        throw tipoInvalido(campo);
    }

    public Long idRelacion(Object valor, String campo) {
        if (!(valor instanceof Map<?, ?> relacion)
                || relacion.size() != 1 || !relacion.containsKey("id")) {
            throw new PatchInvalidoException("El campo '" + campo + "' debe enviarse como {\"id\": número}");
        }
        Object id = relacion.get("id");
        if (id instanceof Number numero) {
            try {
                long resultado = new BigDecimal(numero.toString()).longValueExact();
                if (resultado > 0) {
                    return resultado;
                }
            } catch (ArithmeticException | NumberFormatException ex) {
                // El id no es un entero válido.
            }
        }
        throw new PatchInvalidoException("El id de '" + campo + "' debe ser un entero positivo");
    }

    public <T> void validarEntidad(T entidad) {
        // PATCH recibe un mapa: validamos la entidad completa después de aplicar los cambios.
        Set<ConstraintViolation<T>> errores = validator.validate(entidad);
        if (!errores.isEmpty()) {
            throw new ConstraintViolationException(errores);
        }
    }

    private PatchInvalidoException tipoInvalido(String campo) {
        return new PatchInvalidoException("El campo '" + campo + "' tiene un tipo de dato inválido");
    }
}
