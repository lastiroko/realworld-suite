package com.realworld.dsar.caseapp;

import com.realworld.dsar.caseapp.audit.AuditRepository;
import com.realworld.dsar.caseapp.audit.AuditResponse;
import com.realworld.dsar.caseapp.audit.AuditService;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cases")
public class CaseController {
  private final CaseRepository repo;
  private final CaseService service;
  private final AuditService audit;
  private final AuditRepository auditRepo;

  public CaseController(CaseRepository repo, CaseService service, AuditService audit, AuditRepository auditRepo) {
    this.repo = repo; this.service = service; this.audit = audit; this.auditRepo = auditRepo;
  }

  private static CaseResponse toDto(CaseEntity e) {
    return new CaseResponse(
      e.getId(), e.getReference(), e.getStatus(),
      e.getCreatedAt(), e.getDueAt(), e.getVerifyingAt(), e.getDeliveredAt()
    );
  }

  @GetMapping
  public List<CaseResponse> list(@RequestParam(required=false) String status) {
    var all = repo.findAll().stream().map(CaseController::toDto).toList();
    if (status == null || status.isBlank()) return all;
    String s = status.toUpperCase(Locale.ROOT);
    return all.stream().filter(c -> c.status().equals(s)).toList();
  }

  @GetMapping("/{id}")
  public CaseResponse get(@PathVariable Long id){ return toDto(repo.findById(id).orElseThrow()); }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id){
    repo.deleteById(id);
    audit.log(id, "DELETE", "");
  }

  @GetMapping("/{id}/audit")
  public List<AuditResponse> audit(@PathVariable Long id){
    return auditRepo.findByCaseIdOrderByAtDesc(id).stream()
      .map(e -> new AuditResponse(e.getId(), e.getAction(), e.getAt(), e.getDetails()))
      .toList();
  }

  @GetMapping("/board")
  public Map<String, List<CaseResponse>> board() {
    Map<String, List<CaseResponse>> out = new LinkedHashMap<>();
    out.put("NEW", new ArrayList<>()); out.put("VERIFYING", new ArrayList<>()); out.put("DELIVERED", new ArrayList<>());
    for (var e : repo.findAll()) out.getOrDefault(e.getStatus(), out.get("NEW")).add(toDto(e));
    out.replaceAll((k,v) -> v.stream().sorted(Comparator.comparing(CaseResponse::dueAt)).collect(Collectors.toList()));
    return out;
  }

  @PostMapping
  public CaseResponse create(@RequestBody(required = false) CreateCaseRequest body) {
    CaseEntity e = new CaseEntity();
    e.setReference(UUID.randomUUID().toString());
    if (body != null) {
      if (body.status() != null && !body.status().isBlank()) e.setStatus(body.status().toUpperCase(Locale.ROOT));
      if (body.dueDays() != null && body.dueDays() > 0) {
        Instant created = Instant.now();
        e.setCreatedAt(created);
        e.setDueAt(created.plus(body.dueDays(), ChronoUnit.DAYS));
      }
    }
    e = repo.save(e);
    audit.log(e.getId(), "CREATE", "status=" + e.getStatus() + ", dueAt=" + e.getDueAt());
    return toDto(e);
  }

  @PatchMapping("/{id}/status")
  public CaseResponse transition(@PathVariable Long id, @RequestBody TransitionRequest req) {
    var saved = service.transition(id, req.to().toUpperCase(Locale.ROOT));
    return toDto(saved);
  }
  // --- DEV ONLY: seed demo data ---
  @PostMapping("/dev/seed")
  public Map<String, Object> seed(@RequestParam(defaultValue = "10") int count) {
    var rnd = new java.util.Random();
    int created = 0;
    for (int i = 0; i < count; i++) {
      CaseEntity e = new CaseEntity();
      e.setReference(java.util.UUID.randomUUID().toString());

      // random status distribution
      String[] statuses = {"NEW", "VERIFYING", "DELIVERED"};
      String status = statuses[rnd.nextInt(statuses.length)];
      e.setStatus(status);

      // random SLA between 5 and 40 days from now (some will be overdue by negative)
      int dueDays = 5 + rnd.nextInt(36); // 5..40
      var createdAt = java.time.Instant.now().minusSeconds(rnd.nextInt(10) * 24 * 3600L); // up to 10 days in past
      e.setCreatedAt(createdAt);
      e.setDueAt(createdAt.plusSeconds(dueDays * 24L * 3600L));

      // stamp milestones if needed
      if ("VERIFYING".equals(status)) {
        e.setVerifyingAt(createdAt.plusSeconds(24 * 3600L));
      } else if ("DELIVERED".equals(status)) {
        e.setVerifyingAt(createdAt.plusSeconds(24 * 3600L));
        e.setDeliveredAt(createdAt.plusSeconds(2 * 24 * 3600L));
      }

      e = repo.save(e);
      audit.log(e.getId(), "CREATE", "seed=true status=" + status + ", dueAt=" + e.getDueAt());
      created++;
    }
    return java.util.Map.of("created", created);
  }

}
