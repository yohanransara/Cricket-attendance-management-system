package lk.rusl.cricket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeAttendanceDTO {
    private Long id;
    private LocalDate date;
    private List<String> presentStudentNames;
}
