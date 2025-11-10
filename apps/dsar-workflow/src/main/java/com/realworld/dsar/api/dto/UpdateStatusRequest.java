package com.realworld.dsar.api.dto;

import com.realworld.dsar.domain.RequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateStatusRequest(
    @NotNull RequestStatus status,
    @Size(max = 1000) String resolutionNotes
) {}
