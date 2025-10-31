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
 * Global Exception Handler
 * Centralized exception handling across all controllers.
 * Converts technical exceptions into user-friendly JSON responses
 * that are consistent and descriptive.
 */
@ControllerAdvice
public class RestExceptionHandler {

    // -------------------------------------------------------------
    // Validation errors (from @Valid annotations)
    // -------------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(MethodArgumentNotValidException ex, WebRequest request) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null
                ? String.format("Invalid value for '%s': %s", fieldError.getField(), fieldError.getDefaultMessage())
                : "Validation failed for request data.";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, message, request.getDescription(false)));
    }

    // -------------------------------------------------------------
    // Database constraint or unique key violation
    // -------------------------------------------------------------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        String rootMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        String message;

        if (rootMessage != null) {
            String msg = rootMessage.toLowerCase();
            if (msg.contains("email")) {
                message = "Email already exists.";
            } else if (msg.contains("mobile")) {
                message = "Mobile number already exists.";
            } else if (msg.contains("role_type")) {
                message = "Role type is required for each role.";
            } else if (msg.contains("foreign key")) {
                message = "Referenced entity (e.g. department, municipality, or region) does not exist.";
            } else if (msg.contains("not-null")) {
                message = "A required field was missing or invalid. Please check your input.";
            } else {
                message = "A data integrity violation occurred. Please check your request.";
            }
        } else {
            message = "A data integrity violation occurred. Please check your request.";
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(HttpStatus.CONFLICT, message, request.getDescription(false)));
    }

    // -------------------------------------------------------------
    // Entity not found (e.g. user not found)
    // -------------------------------------------------------------
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(HttpStatus.NOT_FOUND, ex.getMessage(), request.getDescription(false)));
    }

    // -------------------------------------------------------------
    // Illegal arguments (bad IDs or invalid inputs)
    // -------------------------------------------------------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getDescription(false)));
    }

    // -------------------------------------------------------------
    // Catch-all for unexpected exceptions
    // -------------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex, WebRequest request) {
        ex.printStackTrace(); // Useful for debugging locally

        String message = "An unexpected error occurred.";
        String rootMsg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        if (rootMsg.contains("constraint") || rootMsg.contains("not-null")) {
            message = "A required field was missing or invalid. Please check your input.";
        } else if (rootMsg.contains("unknown role type")) {
            message = "Invalid role type. Please use a valid value for 'roleType'.";
        } else if (rootMsg.contains("foreign key")) {
            message = "Referenced entity (like department, municipality, or region) does not exist.";
        } else if (rootMsg.contains("enum")) {
            message = "Invalid enum value provided.";
        } else if (rootMsg.contains("relation") || rootMsg.contains("column")) {
            message = "Database schema mismatch. Please verify database setup.";
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, message, request.getDescription(false)));
    }
}
