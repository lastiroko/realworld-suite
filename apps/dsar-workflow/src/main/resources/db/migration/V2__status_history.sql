CREATE TABLE dsar_status_history (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES dsar_requests(id) ON DELETE CASCADE,
    from_status VARCHAR(32),
    to_status VARCHAR(32) NOT NULL,
    reason TEXT,
    actor VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_dsar_status_history_request ON dsar_status_history(request_id);
CREATE INDEX idx_dsar_status_history_created_at ON dsar_status_history(created_at);
