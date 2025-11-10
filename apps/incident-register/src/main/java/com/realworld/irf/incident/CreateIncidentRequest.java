package com.realworld.irf.incident;
import jakarta.validation.constraints.NotBlank;
public record CreateIncidentRequest(@NotBlank String title, @NotBlank String severity) {}
