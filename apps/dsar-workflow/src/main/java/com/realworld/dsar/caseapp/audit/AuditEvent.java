package com.realworld.dsar.caseapp.audit;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="case_audit_events")
public class AuditEvent {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @Column(nullable=false) private Long caseId;
  @Column(nullable=false, length=32) private String action; // CREATE, TRANSITION, DELETE
  @Column(nullable=false) private Instant at;
  @Column(columnDefinition="text") private String details;

  @PrePersist void pre(){ if(at==null) at = Instant.now(); }

  public Long getId(){ return id; }
  public Long getCaseId(){ return caseId; }
  public void setCaseId(Long v){ caseId=v; }
  public String getAction(){ return action; }
  public void setAction(String v){ action=v; }
  public Instant getAt(){ return at; }
  public void setAt(Instant v){ at=v; }
  public String getDetails(){ return details; }
  public void setDetails(String v){ details=v; }
}
