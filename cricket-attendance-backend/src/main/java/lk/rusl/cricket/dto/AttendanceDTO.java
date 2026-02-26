package lk.rusl.cricket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("sessionId")
    private Long sessionId;
    @JsonProperty("attendance")
    private List<StudentAttendance> attendance;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendance {
        @JsonProperty("studentId")
        private Long studentId;
        @JsonProperty("isPresent")
        private boolean isPresent;
    }
}
