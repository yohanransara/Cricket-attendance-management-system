package lk.rusl.cricket.service;

import lk.rusl.cricket.model.Student;
import lk.rusl.cricket.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student createStudent(Student student) {
        if (studentRepository.findByStudentId(student.getStudentId()).isPresent()) {
            throw new RuntimeException("Student with ID " + student.getStudentId() + " already exists");
        }
        student.setCreatedAt(LocalDateTime.now());
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student studentDetails) {
        Student student = getStudentById(id);
        
        student.setName(studentDetails.getName());
        student.setFaculty(studentDetails.getFaculty());
        student.setYear(studentDetails.getYear());
        student.setContactNumber(studentDetails.getContactNumber());
        
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }
}
