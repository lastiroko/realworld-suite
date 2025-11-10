package com.realworld.dsar.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateDsarRequestRequest(
    @NotBlank @Size(max = 200) String dataSubjectName,
    @NotBlank @Email @Size(max = 320) String dataSubjectEmail,
    @NotBlank @Size(max = 120) String requestType,
    @NotBlank String details,
    @FutureOrPresent(message = "Due date cannot be in the past") LocalDate dueDate
) {}
