package com.example.gestor_gimnasio.exception;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejo de errores centralizado.
 * @RestControllerAdvice "escucha" las excepciones de todos los controllers
 * y devuelve un JSON con el código HTTP correcto en vez de un error 500.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 Bad Request: falló alguna validación (@NotBlank, @Email, @Positive...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
    }

    // 404 Not Found: se envió el id de un plan, socio o clase que no existe
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNoEncontrado(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    // 409 Conflict: se rompió una regla de negocio (socio inactivo, clase sin cupo)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleReglaNegocio(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    // 409 Conflict: la base rechazó la operación (DNI repetido, borrar un plan que tiene socios, etc.)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleIntegridad(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "La operación no se puede realizar porque hay datos relacionados o repetidos"));
    }

    // 400 Bad Request: falta el id de una relación (ej: "socio": {} sin id)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleArgumentoInvalido(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Datos inválidos: falta un id"));
    }
}
