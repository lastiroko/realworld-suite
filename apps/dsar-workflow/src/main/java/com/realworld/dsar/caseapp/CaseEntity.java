package com.realworld.dsar.caseapp;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "cases")
public class CaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 36)
  private String reference;

  @Column(nullable = false, length = 32)
  private String status = "NEW";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) createdAt = Instant.now();
  }

  // getters/setters
  public Long getId() { return id; }
  public String getReference() { return reference; }
  public void setReference(String reference) { this.reference = reference; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
