package lk.rusl.cricket.service;

import lk.rusl.cricket.dto.AttendanceDTO;
import lk.rusl.cricket.model.Attendance;
import lk.rusl.cricket.model.PracticeSession;
import lk.rusl.cricket.model.Student;
import lk.rusl.cricket.repository.AttendanceRepository;
import lk.rusl.cricket.repository.PracticeSessionRepository;
import lk.rusl.cricket.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lk.rusl.cricket.dto.PracticeAttendanceDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final PracticeSessionRepository sessionRepository;
    private final StudentRepository studentRepository;

    public List<PracticeAttendanceDTO> getRecentPracticeAttendance() {
        return sessionRepository.findAll().stream()
                .sorted((s1, s2) -> s2.getDate().compareTo(s1.getDate()))
                .limit(10)
                .map(session -> {
                    List<String> presentNames = attendanceRepository.findByPracticeSession(session).stream()
                            .filter(Attendance::isPresent)
                            .map(a -> a.getStudent().getName())
                            .collect(Collectors.toList());
                    
                    return PracticeAttendanceDTO.builder()
                            .id(session.getId())
                            .date(session.getDate())
                            .presentStudentNames(presentNames)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public PracticeSession createSession(LocalDate date) {
        Optional<PracticeSession> existing = sessionRepository.findByDate(date);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        PracticeSession session = PracticeSession.builder()
                .date(date)
                .createdAt(LocalDateTime.now())
                .build();
        return sessionRepository.save(session);
    }

    @Transactional
    public void markAttendance(AttendanceDTO attendanceDTO) {
        PracticeSession session = sessionRepository.findById(attendanceDTO.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        for (AttendanceDTO.StudentAttendance item : attendanceDTO.getAttendance()) {
            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found: " + item.getStudentId()));

            Optional<Attendance> existing = attendanceRepository.findByPracticeSessionAndStudent(session, student);
            
            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setPresent(item.isPresent());
            } else {
                attendance = Attendance.builder()
                        .practiceSession(session)
                        .student(student)
                        .isPresent(item.isPresent())
                        .build();
            }
            attendanceRepository.save(attendance);
        }
    }

    public List<Attendance> getAttendanceBySession(Long sessionId) {
        PracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return attendanceRepository.findByPracticeSession(session);
    }

    public List<Attendance> getStudentAttendanceHistory(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return attendanceRepository.findByStudent(student);
    }
}
