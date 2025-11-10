package com.realworld.dsar.repository;

import com.realworld.dsar.domain.DsarRequest;
import com.realworld.dsar.domain.RequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DsarRequestRepository extends JpaRepository<DsarRequest, Long> {
    List<DsarRequest> findAllByStatusOrderByDueDateAscIdAsc(RequestStatus status);
    List<DsarRequest> findAllByOrderByDueDateAscIdAsc();
    long countByStatus(RequestStatus status);
}
