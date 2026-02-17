package lk.rusl.cricket.controller;

import lk.rusl.cricket.dto.AttendanceDTO;
import lk.rusl.cricket.model.Attendance;
import lk.rusl.cricket.model.PracticeSession;
import lk.rusl.cricket.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

import lk.rusl.cricket.dto.PracticeAttendanceDTO;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/recent")
    public ResponseEntity<List<PracticeAttendanceDTO>> getRecentAttendance() {
        return ResponseEntity.ok(attendanceService.getRecentPracticeAttendance());
    }

    @PostMapping("/session")
    public ResponseEntity<PracticeSession> createSession(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.createSession(date));
    }

    @PostMapping("/mark")
    public ResponseEntity<Void> markAttendance(@RequestBody AttendanceDTO attendanceDTO) {
        attendanceService.markAttendance(attendanceDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/session/{sessionId}")
    public List<Attendance> getAttendanceBySession(@PathVariable Long sessionId) {
        return attendanceService.getAttendanceBySession(sessionId);
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentAttendanceHistory(@PathVariable Long studentId) {
        return attendanceService.getStudentAttendanceHistory(studentId);
    }
}
