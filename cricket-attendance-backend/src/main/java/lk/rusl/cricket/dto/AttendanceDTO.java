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
public class AttendanceDTO {
    private Long sessionId;
    private List<StudentAttendance> attendance;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendance {
        private Long studentId;
        private boolean isPresent;
    }
}
