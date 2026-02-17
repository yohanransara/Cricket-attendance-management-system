package lk.rusl.cricket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalPracticeDays;
    private long totalPlayers;
    private double averageAttendance;
    private TopAttendeeDTO topAttendee;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopAttendeeDTO {
        private String name;
        private double attendancePercentage;
    }
}
