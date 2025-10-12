package com.realworld.dsar.caseapp;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Service
public class CaseService {
  private final CaseRepository repo;
  public CaseService(CaseRepository repo){ this.repo = repo; }

  private static final Map<String, Set<String>> ALLOWED = Map.of(
    "NEW", Set.of("VERIFYING"),
    "VERIFYING", Set.of("DELIVERED"),
    "DELIVERED", Set.of() // terminal
  );

  @Transactional
  public CaseEntity transition(Long id, String to) {
    CaseEntity e = repo.findById(id).orElseThrow();
    String from = e.getStatus();
    if (!ALLOWED.getOrDefault(from, Set.of()).contains(to)) {
      throw new IllegalArgumentException("Invalid transition: " + from + " -> " + to);
    }
    e.setStatus(to);
    Instant now = Instant.now();
    switch (to) {
      case "VERIFYING" -> e.setVerifyingAt(now);
      case "DELIVERED" -> e.setDeliveredAt(now);
    }
    return repo.save(e);
  }
}
