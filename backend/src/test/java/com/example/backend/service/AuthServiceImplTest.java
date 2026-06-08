package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.example.backend.account.dto.request.LoginRequest;
import com.example.backend.account.dto.request.LogoutRequest;
import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.response.AuthResponse;
import com.example.backend.account.model.Token;
import com.example.backend.account.model.User;
import com.example.backend.account.repository.TokenRepository;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.account.service.UserService;
import com.example.backend.account.service.impl.AuthServiceImpl;
import com.example.backend.exception.TokenNotValidException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.security.JwtService;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @InjectMocks
    private AuthServiceImpl authService;

    @Mock
    private UserRepository userRepository;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private UserService userService;

    @Test
    @DisplayName("Refresh token - valid - return new token")
    void refreshToken_valid_returnNewToken() {
        String oldRefreshToken = "validRefreshToken";
        String newAccessToken = "newAccessToken";
        String newRefreshToken = "newRefreshToken";
        User activeUser = new User();
        activeUser.setUsername("Dat");
        activeUser.setActive(true);

        when(jwtService.extractUsername(oldRefreshToken)).thenReturn("Dat");
        when(userRepository.findByUsername("Dat")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByRefreshToken(oldRefreshToken)).thenReturn(Optional.of(new Token()));
        when(jwtService.isTokenValid(oldRefreshToken, "Dat")).thenReturn(true);
        when(jwtService.generateToken("Dat")).thenReturn(newAccessToken);
        when(jwtService.generateRefreshToken("Dat")).thenReturn(newRefreshToken);

        AuthResponse response = authService.refreshToken(oldRefreshToken);

        assertEquals(newAccessToken, response.getAccessToken());
        assertEquals(newRefreshToken, response.getRefreshToken());

        verify(tokenRepository).deleteByRefreshToken(oldRefreshToken);

        ArgumentCaptor<Token> tokenCaptor = ArgumentCaptor.forClass(Token.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        assertEquals(newAccessToken, tokenCaptor.getValue().getToken());
        assertEquals(newRefreshToken, tokenCaptor.getValue().getRefreshToken());
    }

    @Test
    @DisplayName("Refresh token - invalid - throw TokenNotValidException")
    void refreshToken_invalid_throwTokenNotValidException() {
        // arrange
        String invalidRefreshToken = "invalidRefreshToken";
        User activeUser = new User();
        activeUser.setUsername("Dat");
        activeUser.setActive(true);

        when(jwtService.extractUsername(invalidRefreshToken)).thenReturn("Dat");
        when(userRepository.findByUsername("Dat")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByRefreshToken(invalidRefreshToken)).thenReturn(Optional.empty());

        // act & assert
        assertThrows(TokenNotValidException.class, () -> authService.refreshToken(invalidRefreshToken));
    }

    @Test
    @DisplayName("Login-invalidUser-throw-TokenNotValidException")
    void login_invalidUser_throwTokenNotValidException() {
        // arrange
        User inactiveUser = new User();
        inactiveUser.setUsername("Khong");
        inactiveUser.setActive(false);

        LoginRequest request = new LoginRequest();
        request.setUsername("Khong");
        request.setPassword("123456");

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.of(inactiveUser));

        assertThrows(TokenNotValidException.class, () -> authService.login(request));
        verify(tokenRepository, never()).save(any(Token.class));
    }

    @Test
    @DisplayName("Logout-noMatchToken-throw-TokenNotValidException")
    void logout_noMatchToken_throwTokenNotValidException() {
        LogoutRequest request = new LogoutRequest();
        request.setToken("AccessToken");
        request.setRefreshToken("RefreshToken");

        when(jwtService.extractUsername(request.getToken())).thenReturn("userA");
        when(jwtService.extractUsername(request.getRefreshToken())).thenReturn("userB");
        assertThrows(TokenNotValidException.class, () -> authService.logout(request));
    }

    @Test
    @DisplayName("Logout-invalidRefreshToken-throw-TokenNotValidException")
    void logout_invalidRefreshToken_throwTokenNotValidException() {
        LogoutRequest request = new LogoutRequest();
        request.setToken("accessToken");
        request.setRefreshToken("invalidRefreshToken");

        User activeUser = new User();
        activeUser.setUsername("Dat");
        activeUser.setActive(true);

        when(jwtService.extractUsername(request.getToken())).thenReturn("Dat");
        when(jwtService.extractUsername(request.getRefreshToken())).thenReturn("Dat");

        when(userRepository.findByUsername("Dat")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByRefreshToken(request.getRefreshToken())).thenReturn(Optional.empty());

        assertThrows(TokenNotValidException.class, () -> authService.logout(request));

        verify(tokenRepository, never()).deleteByToken(any());

        verify(tokenRepository, never()).deleteByRefreshToken(any());

    }

    @Test
    @DisplayName("isValidRefreshToken_inactiveUser_returnFalse")
    void isTokenValid_inactiveUser_returnFalse() {
        User inactiveUser = new User();
        inactiveUser.setUsername("Dat");
        inactiveUser.setActive(false);

        when(jwtService.extractUsername("refreshToken")).thenReturn("Dat");
        when(userRepository.findByUsername("Dat")).thenReturn(Optional.of(inactiveUser));

        assertFalse(authService.isValidRefreshToken("refreshToken"));
    }

    @Test
    @DisplayName("isValidRefreshToken - token not in repository - return false")
    void isValidRefreshToken_tokenNotInRepository_returnFalse() {
        String refreshToken = "refreshToken";
        User activeUser = new User();
        activeUser.setUsername("Dat");
        activeUser.setActive(true);

        when(jwtService.extractUsername(refreshToken)).thenReturn("Dat");
        when(userRepository.findByUsername("Dat")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByRefreshToken(refreshToken)).thenReturn(Optional.empty());

        assertFalse(authService.isValidRefreshToken(refreshToken));
        verify(jwtService, never()).isTokenValid(any(), any());
    }

    @Test
    @DisplayName("isValidRefreshToken - active user with token in repository - return true")
    void isValidRefreshToken_validToken_returnTrue() {
        String refreshToken = "refreshToken";
        User activeUser = new User();
        activeUser.setUsername("Dat");
        activeUser.setActive(true);

        when(jwtService.extractUsername(refreshToken)).thenReturn("Dat");
        when(userRepository.findByUsername("Dat")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByRefreshToken(refreshToken)).thenReturn(Optional.of(new Token()));
        when(jwtService.isTokenValid(refreshToken, "Dat")).thenReturn(true);

        assertTrue(authService.isValidRefreshToken(refreshToken));
    }

    @Test
    @DisplayName("Login - valid user - return tokens and save token pair")
    void login_validUser_returnTokensAndSaveTokenPair() {
        LoginRequest request = new LoginRequest();
        request.setUsername("userA");
        request.setPassword("password");

        User activeUser = new User();
        activeUser.setUsername("userA");
        activeUser.setActive(true);

        when(userRepository.findByUsername("userA")).thenReturn(Optional.of(activeUser));
        when(jwtService.generateToken("userA")).thenReturn("accessToken");
        when(jwtService.generateRefreshToken("userA")).thenReturn("refreshToken");

        AuthResponse response = authService.login(request);

        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        ArgumentCaptor<Token> tokenCaptor = ArgumentCaptor.forClass(Token.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        assertEquals("accessToken", tokenCaptor.getValue().getToken());
        assertEquals("refreshToken", tokenCaptor.getValue().getRefreshToken());
    }

    @Test
    @DisplayName("Login - user not found - throw UserNotFoundException")
    void login_userNotFound_throwUserNotFoundException() {
        LoginRequest request = new LoginRequest();
        request.setUsername("missing");
        request.setPassword("password");

        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Logout - valid token pair - delete tokens")
    void logout_validTokenPair_deleteTokens() {
        LogoutRequest request = new LogoutRequest();
        request.setToken("accessToken");
        request.setRefreshToken("refreshToken");

        User activeUser = new User();
        activeUser.setUsername("userA");
        activeUser.setActive(true);

        when(jwtService.extractUsername("accessToken")).thenReturn("userA");
        when(jwtService.extractUsername("refreshToken")).thenReturn("userA");
        when(userRepository.findByUsername("userA")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByRefreshToken("refreshToken")).thenReturn(Optional.of(new Token()));
        when(jwtService.isTokenValid("refreshToken", "userA")).thenReturn(true);
        when(tokenRepository.findByToken("accessToken")).thenReturn(Optional.of(new Token()));

        authService.logout(request);

        verify(tokenRepository).deleteByToken("accessToken");
        verify(tokenRepository).deleteByRefreshToken("refreshToken");
    }

    @Test
    @DisplayName("Register - delegate to user service")
    void register_delegateToUserService() {
        UserRegisterRequest request = new UserRegisterRequest();
        request.setUsername("newUser");
        request.setPassword("pass");
        request.setRole("STUDENT");

        authService.register(request);

        verify(userService).create(request);
    }

    @Test
    @DisplayName("isValidRefreshToken - user not found - throw UserNotFoundException")
    void isValidRefreshToken_userNotFound_throwUserNotFoundException() {
        when(jwtService.extractUsername("refreshToken")).thenReturn("missing");
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.isValidRefreshToken("refreshToken"));
    }
}
