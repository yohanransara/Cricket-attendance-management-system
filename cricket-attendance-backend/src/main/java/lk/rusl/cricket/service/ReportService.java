package lk.rusl.cricket.service;

import lk.rusl.cricket.dto.DashboardStatsDTO;
import lk.rusl.cricket.dto.MonthlyAttendanceDTO;
import lk.rusl.cricket.model.Attendance;
import lk.rusl.cricket.model.Student;
import lk.rusl.cricket.repository.AttendanceRepository;
import lk.rusl.cricket.repository.PracticeSessionRepository;
import lk.rusl.cricket.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final PracticeSessionRepository sessionRepository;

    public DashboardStatsDTO getDashboardStats() {
        long totalPracticeDays = sessionRepository.count();
        long totalPlayers = studentRepository.count();
        
        long totalAttendanceRecords = attendanceRepository.count();
        long presentCount = attendanceRepository.findAll().stream()
                .filter(Attendance::isPresent)
                .count();

        double averageAttendance = totalAttendanceRecords > 0 
                ? (double) presentCount / (totalPracticeDays * totalPlayers) * 100 
                : 0.0;

        DashboardStatsDTO.TopAttendeeDTO topAttendee = null;
        List<Object[]> topAttendees = attendanceRepository.findTopAttendees();
        if (!topAttendees.isEmpty()) {
            Object[] result = topAttendees.get(0);
            Long studentId = (Long) result[0];
            Long totalPresent = (Long) result[1];
            
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student != null) {
                double percentage = totalPracticeDays > 0 
                        ? (double) totalPresent / totalPracticeDays * 100 
                        : 0.0;
                topAttendee = new DashboardStatsDTO.TopAttendeeDTO(student.getName(), percentage);
            }
        }

        return DashboardStatsDTO.builder()
                .totalPracticeDays(totalPracticeDays)
                .totalPlayers(totalPlayers)
                .averageAttendance(averageAttendance)
                .topAttendee(topAttendee)
                .build();
    }

    public lk.rusl.cricket.dto.StudentStatsDTO getStudentStats(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));

        List<Attendance> attendances = attendanceRepository.findByStudent(student);
        long totalSessions = sessionRepository.count();
        long sessionsAttended = attendances.stream().filter(Attendance::isPresent).count();
        
        double attendancePercentage = totalSessions > 0 
                ? (double) sessionsAttended / totalSessions * 100 
                : 0.0;

        List<lk.rusl.cricket.dto.StudentStatsDTO.AttendanceRecordDTO> recentAttendance = attendances.stream()
                .limit(5)
                .map(a -> lk.rusl.cricket.dto.StudentStatsDTO.AttendanceRecordDTO.builder()
                        .date(a.getPracticeSession().getDate().toString())
                        .isPresent(a.isPresent())
                        .build())
                .toList();

        return lk.rusl.cricket.dto.StudentStatsDTO.builder()
                .attendancePercentage(attendancePercentage)
                .sessionsAttended(sessionsAttended)
                .totalSessions(totalSessions)
                .recentAttendance(recentAttendance)
                .build();
    }

    public List<MonthlyAttendanceDTO> getMonthlyAttendance() {
        // Simple mock implementation for now
        List<MonthlyAttendanceDTO> data = new ArrayList<>();
        data.add(new MonthlyAttendanceDTO("Jan", 120, 30));
        data.add(new MonthlyAttendanceDTO("Feb", 145, 25));
        return data;
    }
}
