package lk.rusl.cricket.controller;

import lk.rusl.cricket.dto.DashboardStatsDTO;
import lk.rusl.cricket.dto.MonthlyAttendanceDTO;
import lk.rusl.cricket.dto.StudentStatsDTO;
import lk.rusl.cricket.service.ReportService;
import lk.rusl.cricket.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH', 'SPORTS_OFFICER')")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentStatsDTO> getStudentStats(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(reportService.getStudentStats(principal.getId()));
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH', 'SPORTS_OFFICER')")
    public ResponseEntity<List<MonthlyAttendanceDTO>> getMonthlyAttendance() {
        return ResponseEntity.ok(reportService.getMonthlyAttendance());
    }
}
