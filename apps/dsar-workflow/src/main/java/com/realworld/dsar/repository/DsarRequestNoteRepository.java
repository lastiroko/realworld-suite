package com.realworld.dsar.repository;

import com.realworld.dsar.domain.DsarRequestNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DsarRequestNoteRepository extends JpaRepository<DsarRequestNote, Long> {
    List<DsarRequestNote> findAllByRequestIdOrderByCreatedAtAsc(Long requestId);
}
