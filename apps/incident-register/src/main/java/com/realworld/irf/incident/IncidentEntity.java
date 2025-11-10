package com.realworld.irf.incident;
import jakarta.persistence.*; import java.time.*; import java.time.temporal.ChronoUnit;

@Entity @Table(name="incidents")
public class IncidentEntity {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, length=140) private String title;
  @Column(nullable=false, length=16)  private String severity; // LOW/MEDIUM/HIGH
  @Column(nullable=false, length=24)  private String state = "OPEN"; // OPEN->SECTION8->CLOSED
  @Column(nullable=false) private Instant createdAt;
  @Column(nullable=false) private Instant updatedAt;
  @Column(nullable=false) private Instant dueAt; // createdAt + 7d
  private Instant section8ApprovedAt; private Instant closedAt;

  @PrePersist void pre(){ var now=Instant.now(); if(createdAt==null)createdAt=now; if(updatedAt==null)updatedAt=now; if(dueAt==null)dueAt=createdAt.plus(7, ChronoUnit.DAYS); }
  @PreUpdate void upd(){ updatedAt=Instant.now(); }

  public Long getId(){return id;}
  public String getTitle(){return title;} public void setTitle(String v){title=v;}
  public String getSeverity(){return severity;} public void setSeverity(String v){severity=v;}
  public String getState(){return state;} public void setState(String v){state=v;}
  public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
  public Instant getDueAt(){return dueAt;}
  public Instant getSection8ApprovedAt(){return section8ApprovedAt;} public void setSection8ApprovedAt(Instant v){section8ApprovedAt=v;}
  public Instant getClosedAt(){return closedAt;} public void setClosedAt(Instant v){closedAt=v;}
}
