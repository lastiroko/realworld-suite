package com.realworld.dsar.api.dto;

import com.realworld.dsar.domain.RequestStatus;
import java.time.Instant;

public record StatusHistoryResponse(
    Long id,
    Long requestId,
    RequestStatus fromStatus,
    RequestStatus toStatus,
    String reason,
    String actor,
    Instant createdAt
) {}
