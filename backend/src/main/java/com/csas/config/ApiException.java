package com.csas.config;

import org.springframework.http.HttpStatus;

/** Thrown by services for any expected business-rule failure (bad login, seat taken, etc). */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
