package com.realworld.dsar.api.dto;

import java.time.Instant;

public record DsarRequestNoteResponse(
    Long id,
    String author,
    String content,
    Instant createdAt
) {}
