package com.realworld.dsar.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dsar_requests")
public class DsarRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_subject_name", nullable = false)
    private String dataSubjectName;

    @Column(name = "data_subject_email", nullable = false)
    private String dataSubjectEmail;

    @Column(name = "request_type", nullable = false)
    private String requestType;

    @Column(name = "details", nullable = false, columnDefinition = "text")
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.NEW;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DsarRequestNote> notes = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public void addNote(DsarRequestNote note) {
        notes.add(note);
        note.setRequest(this);
    }

    public void removeNote(DsarRequestNote note) {
        notes.remove(note);
        note.setRequest(null);
    }

    public Long getId() {
        return id;
    }

    public String getDataSubjectName() {
        return dataSubjectName;
    }

    public void setDataSubjectName(String dataSubjectName) {
        this.dataSubjectName = dataSubjectName;
    }

    public String getDataSubjectEmail() {
        return dataSubjectEmail;
    }

    public void setDataSubjectEmail(String dataSubjectEmail) {
        this.dataSubjectEmail = dataSubjectEmail;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<DsarRequestNote> getNotes() {
        return notes;
    }
}
