package nl.saxion.disaster.user_service.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

/**
 * Centralized exception handling for the entire application.
 * Transforms technical exceptions into meaningful JSON responses for the client.
 */
@ControllerAdvice
public class RestExceptionHandler {

    /**
     * Handles validation errors thrown by @Valid annotations (e.g., @NotBlank, @Email).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(MethodArgumentNotValidException ex, WebRequest request) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null
                ? String.format("Invalid value for '%s': %s", fieldError.getField(), fieldError.getDefaultMessage())
                : "Validation failed";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, message, request.getDescription(false)));
    }

    /**
     * Handles unique constraint or database-level integrity violations.
     * Maps them to human-readable messages.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        String rootMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        String message;

        if (rootMessage != null) {
            String msg = rootMessage.toLowerCase();
            if (msg.contains("uk6dotkott2kjsp8vw4d0m25fb7") || msg.contains("email")) {
                message = "Email already exists.";
            } else if (msg.contains("uk63cf888pmqtt5tipcne79xsbm") || msg.contains("mobile")) {
                message = "Mobile number already exists.";
            } else {
                message = "Data integrity violation.";
            }
        } else {
            message = "Data integrity violation.";
        }


        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(HttpStatus.CONFLICT, message, request.getDescription(false)));
    }

    /**
     * Handles missing entities or lookups.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(HttpStatus.NOT_FOUND, ex.getMessage(), request.getDescription(false)));
    }

    /**
     * Handles illegal arguments (e.g., bad request body values, invalid IDs, etc.)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getDescription(false)));
    }

    /**
     * Fallback for all unhandled exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex, WebRequest request) {
        ex.printStackTrace(); // keep for local debugging
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request.getDescription(false)));
    }
}
