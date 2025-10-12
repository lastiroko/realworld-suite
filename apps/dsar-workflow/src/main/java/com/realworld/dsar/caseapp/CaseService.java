package com.realworld.dsar.caseapp;

import com.realworld.dsar.caseapp.audit.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Service
public class CaseService {
  private final CaseRepository repo;
  private final AuditService audit;

  public CaseService(CaseRepository repo, AuditService audit){
    this.repo = repo; this.audit = audit;
  }

  private static final Map<String, Set<String>> ALLOWED = Map.of(
    "NEW", Set.of("VERIFYING"),
    "VERIFYING", Set.of("DELIVERED"),
    "DELIVERED", Set.of()
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
    var saved = repo.save(e);
    audit.log(saved.getId(), "TRANSITION", from + "->" + to);
    return saved;
  }
}
