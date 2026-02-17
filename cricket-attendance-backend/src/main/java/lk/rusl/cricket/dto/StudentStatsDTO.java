package lk.rusl.cricket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsDTO {
    private double attendancePercentage;
    private long sessionsAttended;
    private long totalSessions;
    private List<AttendanceRecordDTO> recentAttendance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceRecordDTO {
        private String date;
        private boolean isPresent;
    }
}
