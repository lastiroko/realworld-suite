package com.realworld.dsar.service;

import com.realworld.dsar.domain.DsarRequest;
import com.realworld.dsar.domain.DsarRequestNote;
import com.realworld.dsar.domain.RequestStatus;
import com.realworld.dsar.domain.StatusHistoryEvent;
import com.realworld.dsar.repository.DsarRequestNoteRepository;
import com.realworld.dsar.repository.DsarRequestRepository;
import com.realworld.dsar.repository.StatusHistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DsarRequestService {

    private final DsarRequestRepository requestRepository;
    private final DsarRequestNoteRepository noteRepository;
    private final StatusHistoryRepository historyRepository;

    public DsarRequestService(
        DsarRequestRepository requestRepository,
        DsarRequestNoteRepository noteRepository,
        StatusHistoryRepository historyRepository
    ) {
        this.requestRepository = requestRepository;
        this.noteRepository = noteRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public DsarRequest getById(Long id) {
        return requestRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Request %d not found".formatted(id)));
    }

    @Transactional
    public DsarRequest save(DsarRequest request) {
        boolean isNew = request.getId() == null;
        DsarRequest saved = requestRepository.save(request);
        if (isNew) {
            historyRepository.save(StatusHistoryEvent.of(
                saved.getId(), null, saved.getStatus(), "Request created", "system"
            ));
        }
        return saved;
    }

    @Transactional
    public DsarRequest updateStatus(Long id, RequestStatus newStatus, String noteContent) {
        DsarRequest entity = getById(id);
        if (entity.getStatus() == RequestStatus.COMPLETED || entity.getStatus() == RequestStatus.REJECTED) {
            throw new IllegalStateException("Resolved requests cannot transition to another status");
        }
        RequestStatus previous = entity.getStatus();
        entity.setStatus(newStatus);
        if (noteContent != null && !noteContent.isBlank()) {
            DsarRequestNote note = new DsarRequestNote();
            note.setAuthor("system");
            note.setContent(noteContent);
            entity.addNote(note);
        }
        DsarRequest saved = requestRepository.save(entity);
        historyRepository.save(StatusHistoryEvent.of(
            saved.getId(), previous, newStatus, noteContent, "operator"
        ));
        return saved;
    }

    @Transactional(readOnly = true)
    public List<DsarRequest> list(RequestStatus status) {
        if (status != null) {
            return requestRepository.findAllByStatusOrderByDueDateAscIdAsc(status);
        }
        return requestRepository.findAllByOrderByDueDateAscIdAsc();
    }

    @Transactional
    public DsarRequestNote addNote(Long requestId, DsarRequestNote note) {
        DsarRequest request = getById(requestId);
        request.addNote(note);
        requestRepository.save(request);
        return note;
    }

    @Transactional(readOnly = true)
    public List<DsarRequestNote> getNotes(Long requestId) {
        getById(requestId);
        return noteRepository.findAllByRequestIdOrderByCreatedAtAsc(requestId);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryEvent> getHistory(Long requestId) {
        getById(requestId);
        return historyRepository.findAllByRequestIdOrderByCreatedAtAsc(requestId);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryEvent> getRecentHistory(int limit) {
        int safe = Math.min(Math.max(limit, 1), 100);
        return historyRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safe));
    }

    @Transactional(readOnly = true)
    public Map<RequestStatus, Long> summarizeByStatus() {
        Map<RequestStatus, Long> summary = new EnumMap<>(RequestStatus.class);
        for (RequestStatus status : RequestStatus.values()) {
            summary.put(status, requestRepository.countByStatus(status));
        }
        return summary;
    }
}
