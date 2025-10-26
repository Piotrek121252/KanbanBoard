package pl.pwr.edu.KanbanBoard.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.BoardAccessDeniedException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.BoardNotFoundException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.ColumnNotFoundException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.IllegalBoardRoleException;

import java.util.Date;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BoardNotFoundException.class)
    public ResponseEntity<ErrorObject> handleBoardNotFoundException(BoardNotFoundException ex, WebRequest request) {
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(HttpStatus.NOT_FOUND.value());
        errorObject.setMessage(ex.getMessage());
        errorObject.setTimestamp(new Date());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorObject);
    }

    @ExceptionHandler(ColumnNotFoundException.class)
    public ResponseEntity<ErrorObject> handleColumnNotFound(ColumnNotFoundException ex, WebRequest request) {
        // Można użyć WebRequest do pobrania dodatkowych informacji o request
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(HttpStatus.NOT_FOUND.value());
        errorObject.setMessage(ex.getMessage());
        errorObject.setTimestamp(new Date());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorObject);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorObject> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        ErrorObject error = new ErrorObject();
        error.setStatusCode(HttpStatus.UNAUTHORIZED.value());
        error.setMessage("Nazwa użytkownika lub hasło są nieprawidłowe.");
        error.setTimestamp(new Date());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalBoardRoleException.class)
    public ResponseEntity<ErrorObject> handleIllegalBoardRole(IllegalBoardRoleException ex) {
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(HttpStatus.BAD_REQUEST.value());
        errorObject.setMessage(ex.getMessage());
        errorObject.setTimestamp(new Date());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorObject);
    }

    @ExceptionHandler(BoardAccessDeniedException.class)
    public ResponseEntity<ErrorObject> handleBoardAccessDenied(BoardAccessDeniedException ex) {
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(HttpStatus.FORBIDDEN.value());
        errorObject.setMessage(ex.getMessage());
        errorObject.setTimestamp(new Date());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorObject);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorObject> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(HttpStatus.BAD_REQUEST.value());
        errorObject.setMessage(ex.getMessage());
        errorObject.setTimestamp(new Date());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorObject);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorObject> handleRuntimeException(RuntimeException ex, WebRequest request) {
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorObject.setMessage("Internal server error: " + ex.getMessage());
        errorObject.setTimestamp(new Date());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorObject);
    }
}
