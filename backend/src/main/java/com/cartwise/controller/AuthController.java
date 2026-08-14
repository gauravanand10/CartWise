package com.cartwise.controller;

import com.cartwise.common.dto.AuthResponse;
import com.cartwise.common.dto.LoginRequest;
import com.cartwise.common.dto.SignupRequest;
import com.cartwise.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The two endpoints that hand out tokens.
 *
 * <p>Both are public — they are how a caller gets the credential every other protected endpoint
 * demands, so requiring one to reach them would be a locked door with the key inside.
 * {@code SecurityConfig} permits {@code /api/auth/**} for exactly that reason, which makes this the
 * one controller whose input arrives entirely unauthenticated and therefore the one whose validation
 * matters most.
 *
 * <p>Both are {@code POST}, including login, which reads rather than writes. A GET would put the
 * password in the URL, and URLs are logged by every proxy and server in the path, kept in browser
 * history, and sent in {@code Referer} headers. The verb follows where the data has to go, not the
 * shape of the operation.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * {@code POST /api/auth/signup} — register and receive a token.
     *
     * <p>201 Created with {@code {userId, email, token}}. A resource was created and the response
     * describes it, which is what 201 is for.
     *
     * <p>400 if the body is missing fields, the email is not address-shaped, or the password is
     * shorter than 8 characters or longer than 72 bytes. 409 if the address already has an account.
     *
     * <p>No {@code Location} header, though 201 conventionally carries one: it would point at a
     * user resource, and this API has no endpoint that returns a user. Sending a header to a route
     * that does not exist is worse than omitting it.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        requirePresent(request.email(), request.password());

        AuthResponse response = authService.signup(request.email(), request.password());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * {@code POST /api/auth/login} — exchange credentials for a token.
     *
     * <p>200 OK with {@code {userId, email, token}}. Nothing was created, so not 201.
     *
     * <p>401 for any credential failure, whether the email is unknown or the password is wrong, with
     * the same body in both cases. <strong>Not 404 for an unknown email</strong> — see
     * {@link com.cartwise.common.exception.InvalidCredentialsException} for why that distinction
     * would be a user-enumeration oracle. 400 only for a body that is missing fields, which is a
     * statement about the request rather than about any account.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        requirePresent(request.email(), request.password());

        return ResponseEntity.ok(authService.login(request.email(), request.password()));
    }

    /**
     * Rejects an absent field before the request reaches the service.
     *
     * <p>Deliberately says only that something is missing, with no hint about which value would have
     * been acceptable — and note it is the same check for both endpoints, so a malformed login and a
     * malformed signup are answered identically.
     *
     * <p>{@code isEmpty} rather than {@code isBlank} for the password: a password of spaces is
     * unusual but legitimate, and silently rejecting it would mean a password that can be set and
     * then never used.
     */
    private void requirePresent(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isEmpty()) {
            throw new IllegalArgumentException("email and password are required");
        }
    }
}
