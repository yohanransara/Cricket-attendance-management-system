package lk.rusl.cricket.config;

import lk.rusl.cricket.model.Role;
import lk.rusl.cricket.model.Student;
import lk.rusl.cricket.model.User;
import lk.rusl.cricket.repository.StudentRepository;
import lk.rusl.cricket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed Admin User
        if (userRepository.findByEmail("admin@rusl.lk").isEmpty()) {
            User admin = User.builder()
                    .email("admin@rusl.lk")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded default admin user");
        }

        // Seed Sample Students and Student User
        if (studentRepository.count() == 0) {
            User studentUser = User.builder()
                    .email("student@tec.rjt.ac.lk")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(studentUser);

            Student john = Student.builder()
                    .studentId("TG/2021/001")
                    .name("John Doe")
                    .faculty("FOT")
                    .year(2021)
                    .contactNumber("0712345678")
                    .user(studentUser)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            List<Student> students = List.of(
                john,
                Student.builder().studentId("TG/2021/002").name("Jane Smith").faculty("FAS").year(2021).contactNumber("0712345679").createdAt(LocalDateTime.now()).build(),
                Student.builder().studentId("TG/2022/045").name("Kamal Perera").faculty("FMC").year(2022).contactNumber("0723456789").createdAt(LocalDateTime.now()).build(),
                Student.builder().studentId("TG/2020/120").name("Namal Silva").faculty("FSL").year(2020).contactNumber("0754567890").createdAt(LocalDateTime.now()).build()
            );
            studentRepository.saveAll(students);
            System.out.println("Seeded sample student data and student user account");
        }
    }
}
