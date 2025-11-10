CREATE TABLE dsar_requests (
    id BIGSERIAL PRIMARY KEY,
    data_subject_name VARCHAR(200) NOT NULL,
    data_subject_email VARCHAR(320) NOT NULL,
    request_type VARCHAR(120) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE dsar_request_notes (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES dsar_requests(id) ON DELETE CASCADE,
    author VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_dsar_requests_status ON dsar_requests(status);
CREATE INDEX idx_dsar_requests_due_date ON dsar_requests(due_date);
CREATE INDEX idx_dsar_request_notes_request ON dsar_request_notes(request_id);
