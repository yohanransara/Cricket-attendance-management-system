package lk.rusl.cricket.dto;

import lk.rusl.cricket.model.PracticeSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionAttendanceDTO {
    private PracticeSession session;
    private List<StudentAttendanceRecordDTO> attendance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceRecordDTO {
        private Long studentId;
        private String studentRegId;
        private String studentName;
        private boolean isPresent;
    }
}
