package com.realworld.dsar.api.dto;

import com.realworld.dsar.domain.RequestStatus;
import java.time.Instant;
import java.time.LocalDate;

public record DsarRequestResponse(
    Long id,
    String dataSubjectName,
    String dataSubjectEmail,
    String requestType,
    String details,
    RequestStatus status,
    LocalDate dueDate,
    Instant createdAt,
    Instant updatedAt
) {}
