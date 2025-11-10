package com.realworld.irf.incident;
import java.time.Instant;
public record IncidentResponse(Long id, String title, String severity, String state,
  Instant createdAt, Instant dueAt, Instant section8ApprovedAt, Instant closedAt) {}
