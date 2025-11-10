package com.realworld.dsar.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddNoteRequest(
    @NotBlank @Size(max = 120) String author,
    @NotBlank String content
) {}
