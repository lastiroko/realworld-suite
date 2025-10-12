package com.realworld.dsar.caseapp.audit;
import java.time.Instant;
public record AuditResponse(Long id, String action, Instant at, String details) {}
