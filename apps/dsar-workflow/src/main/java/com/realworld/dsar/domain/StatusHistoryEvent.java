package com.realworld.dsar.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "dsar_status_history")
public class StatusHistoryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private RequestStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private RequestStatus toStatus;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @Column(name = "actor", nullable = false)
    private String actor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    public static StatusHistoryEvent of(Long requestId, RequestStatus from, RequestStatus to, String reason, String actor) {
        StatusHistoryEvent event = new StatusHistoryEvent();
        event.requestId = requestId;
        event.fromStatus = from;
        event.toStatus = to;
        event.reason = reason;
        event.actor = actor;
        return event;
    }

    public Long getId() { return id; }
    public Long getRequestId() { return requestId; }
    public RequestStatus getFromStatus() { return fromStatus; }
    public RequestStatus getToStatus() { return toStatus; }
    public String getReason() { return reason; }
    public String getActor() { return actor; }
    public Instant getCreatedAt() { return createdAt; }
}
