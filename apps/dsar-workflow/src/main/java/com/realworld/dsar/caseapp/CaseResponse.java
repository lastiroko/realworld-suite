package com.realworld.dsar.caseapp;

import java.time.Instant;

public record CaseResponse(
  Long id, String reference, String status,
  Instant createdAt, Instant dueAt, Instant verifyingAt, Instant deliveredAt
) {}
