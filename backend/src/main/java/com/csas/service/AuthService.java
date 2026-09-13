package com.csas.service;

import com.csas.config.ApiException;
import com.csas.dto.LoginRequest;
import com.csas.dto.LoginResponse;
import com.csas.dto.RegisterRequest;
import com.csas.entity.Student;
import com.csas.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (studentRepository.existsByStudentId(request.getStudentId())) {
            throw new ApiException("An account with this Student ID already exists.", HttpStatus.CONFLICT);
        }
        Student student = new Student(
                request.getStudentName().trim(),
                request.getStudentId().trim(),
                passwordEncoder.encode(request.getPassword())
        );
        Student saved = studentRepository.save(student);
        return new LoginResponse(saved.getId(), saved.getStudentName(), saved.getStudentId());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Student student = studentRepository.findByStudentId(request.getStudentId().trim())
                .orElseThrow(() -> new ApiException("Invalid login credentials.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new ApiException("Invalid login credentials.", HttpStatus.UNAUTHORIZED);
        }

        return new LoginResponse(student.getId(), student.getStudentName(), student.getStudentId());
    }
}
