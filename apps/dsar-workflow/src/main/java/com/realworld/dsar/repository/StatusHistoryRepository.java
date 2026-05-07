package com.realworld.dsar.repository;

import com.realworld.dsar.domain.StatusHistoryEvent;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusHistoryRepository extends JpaRepository<StatusHistoryEvent, Long> {
    List<StatusHistoryEvent> findAllByRequestIdOrderByCreatedAtAsc(Long requestId);
    List<StatusHistoryEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
