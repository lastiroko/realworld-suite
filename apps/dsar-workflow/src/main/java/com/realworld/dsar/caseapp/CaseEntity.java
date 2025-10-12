package com.realworld.dsar.caseapp;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

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

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  // SLA due = createdAt + 30 days
  @Column(name = "due_at", nullable = false)
  private Instant dueAt;

  // Milestone timestamps
  @Column(name = "verifying_at")
  private Instant verifyingAt;

  @Column(name = "delivered_at")
  private Instant deliveredAt;

  @PrePersist
  void prePersist() {
    Instant now = Instant.now();
    if (createdAt == null) createdAt = now;
    if (updatedAt == null) updatedAt = now;
    if (dueAt == null) dueAt = createdAt.plus(30, ChronoUnit.DAYS);
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }

  // getters/setters
  public Long getId() { return id; }
  public String getReference() { return reference; }
  public void setReference(String reference) { this.reference = reference; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
  public Instant getDueAt() { return dueAt; }
  public void setDueAt(Instant dueAt) { this.dueAt = dueAt; }
  public Instant getVerifyingAt() { return verifyingAt; }
  public void setVerifyingAt(Instant verifyingAt) { this.verifyingAt = verifyingAt; }
  public Instant getDeliveredAt() { return deliveredAt; }
  public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
}
