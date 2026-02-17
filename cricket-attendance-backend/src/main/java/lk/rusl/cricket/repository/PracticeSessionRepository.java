package lk.rusl.cricket.repository;

import lk.rusl.cricket.model.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    Optional<PracticeSession> findByDate(LocalDate date);
}
