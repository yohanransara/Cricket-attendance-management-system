package lk.rusl.cricket.repository;

import lk.rusl.cricket.model.Attendance;
import lk.rusl.cricket.model.PracticeSession;
import lk.rusl.cricket.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByPracticeSession(PracticeSession session);
    List<Attendance> findByStudent(Student student);
    Optional<Attendance> findByPracticeSessionAndStudent(PracticeSession session, Student student);

    @org.springframework.data.jpa.repository.Query("SELECT a.student.id, COUNT(a) as total FROM Attendance a WHERE a.isPresent = true GROUP BY a.student.id ORDER BY total DESC")
    List<Object[]> findTopAttendees();
}
