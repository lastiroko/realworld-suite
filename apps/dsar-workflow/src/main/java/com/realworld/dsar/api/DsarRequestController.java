package com.realworld.dsar.api;

import com.realworld.dsar.api.dto.AddNoteRequest;
import com.realworld.dsar.api.dto.CreateDsarRequestRequest;
import com.realworld.dsar.api.dto.DsarRequestNoteResponse;
import com.realworld.dsar.api.dto.DsarRequestResponse;
import com.realworld.dsar.api.dto.RequestSummaryResponse;
import com.realworld.dsar.api.dto.StatusHistoryResponse;
import com.realworld.dsar.api.dto.UpdateDsarRequestRequest;
import com.realworld.dsar.api.dto.UpdateStatusRequest;
import com.realworld.dsar.domain.DsarRequest;
import com.realworld.dsar.domain.RequestStatus;
import com.realworld.dsar.service.DsarRequestService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requests")
public class DsarRequestController {

    private final DsarRequestService requestService;

    public DsarRequestController(DsarRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ResponseEntity<DsarRequestResponse> create(@Valid @RequestBody CreateDsarRequestRequest requestDto) {
        DsarRequest entity = DsarRequestMapper.toEntity(requestDto);
        DsarRequest saved = requestService.save(entity);
        return ResponseEntity
            .created(URI.create("/api/requests/" + saved.getId()))
            .body(DsarRequestMapper.toResponse(saved));
    }

    @GetMapping
    public List<DsarRequestResponse> list(@RequestParam(value = "status", required = false) RequestStatus status) {
        return requestService.list(status).stream()
            .map(DsarRequestMapper::toResponse)
            .toList();
    }

    @GetMapping("/{id}")
    public DsarRequestResponse get(@PathVariable Long id) {
        return DsarRequestMapper.toResponse(requestService.getById(id));
    }

    @PutMapping("/{id}")
    public DsarRequestResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateDsarRequestRequest requestDto
    ) {
        DsarRequest entity = requestService.getById(id);
        DsarRequestMapper.updateEntity(requestDto, entity);
        DsarRequest saved = requestService.save(entity);
        return DsarRequestMapper.toResponse(saved);
    }

    @PatchMapping("/{id}/status")
    public DsarRequestResponse updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateStatusRequest requestDto
    ) {
        String noteContent = requestDto.resolutionNotes() == null || requestDto.resolutionNotes().isBlank()
            ? null
            : "Status changed to %s: %s".formatted(requestDto.status(), requestDto.resolutionNotes());
        DsarRequest saved = requestService.updateStatus(id, requestDto.status(), noteContent);
        return DsarRequestMapper.toResponse(saved);
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<DsarRequestNoteResponse> addNote(
        @PathVariable Long id,
        @Valid @RequestBody AddNoteRequest requestDto
    ) {
        var saved = requestService.addNote(id, DsarRequestMapper.toEntity(requestDto));
        return ResponseEntity.status(HttpStatus.CREATED).body(DsarRequestMapper.toResponse(saved));
    }

    @GetMapping("/{id}/notes")
    public List<DsarRequestNoteResponse> listNotes(@PathVariable Long id) {
        return requestService.getNotes(id).stream()
            .map(DsarRequestMapper::toResponse)
            .toList();
    }

    @GetMapping("/summary/status")
    public RequestSummaryResponse summarizeByStatus() {
        Map<RequestStatus, Long> summary = requestService.summarizeByStatus();
        return new RequestSummaryResponse(summary);
    }

    @GetMapping("/{id}/history")
    public List<StatusHistoryResponse> history(@PathVariable Long id) {
        return requestService.getHistory(id).stream()
            .map(DsarRequestMapper::toResponse)
            .toList();
    }

    @GetMapping("/history/recent")
    public List<StatusHistoryResponse> recentHistory(
        @RequestParam(value = "limit", defaultValue = "30") int limit
    ) {
        return requestService.getRecentHistory(limit).stream()
            .map(DsarRequestMapper::toResponse)
            .toList();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest().body(ex.getBindingResult().toString());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}
