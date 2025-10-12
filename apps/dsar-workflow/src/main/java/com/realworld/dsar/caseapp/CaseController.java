package com.realworld.dsar.caseapp;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cases")
public class CaseController {
  private final CaseRepository repo;
  private final CaseService service;

  public CaseController(CaseRepository repo, CaseService service) {
    this.repo = repo; this.service = service;
  }

  private static CaseResponse toDto(CaseEntity e) {
    return new CaseResponse(e.getId(), e.getReference(), e.getStatus(),
      e.getCreatedAt(), e.getDueAt(), e.getVerifyingAt(), e.getDeliveredAt());
  }

  @GetMapping
  public List<CaseResponse> list(@RequestParam(required=false) String status) {
    var all = repo.findAll().stream().map(CaseController::toDto).toList();
    if (status == null || status.isBlank()) return all;
    String s = status.toUpperCase(Locale.ROOT);
    return all.stream().filter(c -> c.status().equals(s)).toList();
  }

  @GetMapping("/board")
  public Map<String, List<CaseResponse>> board() {
    Map<String, List<CaseResponse>> out = new LinkedHashMap<>();
    out.put("NEW", new ArrayList<>());
    out.put("VERIFYING", new ArrayList<>());
    out.put("DELIVERED", new ArrayList<>());
    for (var e : repo.findAll()) {
      out.getOrDefault(e.getStatus(), out.get("NEW")).add(toDto(e));
    }
    // Sort by due date ascending in each column
    out.replaceAll((k,v) -> v.stream().sorted(Comparator.comparing(CaseResponse::dueAt)).collect(Collectors.toList()));
    return out;
  }

  @PostMapping
  public CaseResponse create(@RequestBody(required = false) CreateCaseRequest body) {
    CaseEntity e = new CaseEntity();
    e.setReference(UUID.randomUUID().toString());
    if (body != null && body.status() != null && !body.status().isBlank()) {
      e.setStatus(body.status().toUpperCase(Locale.ROOT));
    }
    e = repo.save(e);
    return toDto(e);
  }

  @PatchMapping("/{id}/status")
  public CaseResponse transition(@PathVariable Long id, @RequestBody TransitionRequest req) {
    var saved = service.transition(id, req.to().toUpperCase(Locale.ROOT));
    return toDto(saved);
  }
}
