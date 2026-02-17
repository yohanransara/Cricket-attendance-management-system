package lk.rusl.cricket.service;

import lk.rusl.cricket.dto.LoginRequest;
import lk.rusl.cricket.dto.LoginResponse;
import lk.rusl.cricket.dto.RegisterRequest;
import lk.rusl.cricket.model.Role;
import lk.rusl.cricket.model.Student;
import lk.rusl.cricket.model.User;
import lk.rusl.cricket.repository.StudentRepository;
import lk.rusl.cricket.repository.UserRepository;
import lk.rusl.cricket.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public void register(RegisterRequest request) {
        // Domain validation
        if (!request.getEmail().toLowerCase().endsWith("@tec.rjt.ac.lk")) {
            throw new RuntimeException("Only @tec.rjt.ac.lk email addresses are allowed for student registration");
        }

        // Unique checks
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        if (studentRepository.findByStudentId(request.getStudentId()).isPresent()) {
            throw new RuntimeException("Student ID already exists");
        }

        // Create User
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .createdAt(LocalDateTime.now())
                .build();
        
        user = userRepository.save(user);

        // Create Student Profile
        Student student = Student.builder()
                .studentId(request.getStudentId())
                .name(request.getName())
                .faculty(request.getFaculty())
                .year(request.getYear())
                .contactNumber(request.getContactNumber())
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();
        
        studentRepository.save(student);
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Strict domain enforcement for students
        if (user.getRole() == Role.STUDENT && !user.getEmail().toLowerCase().endsWith("@tec.rjt.ac.lk")) {
            throw new RuntimeException("Student access is restricted to @tec.rjt.ac.lk email addresses only");
        }

        String token = jwtUtil.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build()
        );

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
