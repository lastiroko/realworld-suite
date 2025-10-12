package com.realworld.dsar.caseapp;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

  private final CaseRepository repo;

  public CaseController(CaseRepository repo) { this.repo = repo; }

  @GetMapping
  public List<CaseResponse> list() {
    return repo.findAll().stream()
      .map(e -> new CaseResponse(e.getId(), e.getReference(), e.getStatus(), e.getCreatedAt()))
      .collect(Collectors.toList());
  }

  @PostMapping
  public CaseResponse create(@RequestBody(required = false) CreateCaseRequest body) {
    CaseEntity e = new CaseEntity();
    e.setReference(UUID.randomUUID().toString());
    if (body != null && body.status() != null && !body.status().isBlank()) {
      e.setStatus(body.status());
    }
    e = repo.save(e);
    return new CaseResponse(e.getId(), e.getReference(), e.getStatus(), e.getCreatedAt());
  }
}
