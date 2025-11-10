package com.realworld.dsar.api.dto;

import com.realworld.dsar.domain.RequestStatus;
import java.util.Map;

public record RequestSummaryResponse(Map<RequestStatus, Long> totals) {}
