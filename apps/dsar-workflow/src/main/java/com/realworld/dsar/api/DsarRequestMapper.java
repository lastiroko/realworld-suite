package com.realworld.dsar.api;

import com.realworld.dsar.api.dto.AddNoteRequest;
import com.realworld.dsar.api.dto.CreateDsarRequestRequest;
import com.realworld.dsar.api.dto.DsarRequestNoteResponse;
import com.realworld.dsar.api.dto.DsarRequestResponse;
import com.realworld.dsar.api.dto.UpdateDsarRequestRequest;
import com.realworld.dsar.domain.DsarRequest;
import com.realworld.dsar.domain.DsarRequestNote;

public final class DsarRequestMapper {

    private DsarRequestMapper() {}

    public static DsarRequest toEntity(CreateDsarRequestRequest request) {
        DsarRequest entity = new DsarRequest();
        entity.setDataSubjectName(request.dataSubjectName());
        entity.setDataSubjectEmail(request.dataSubjectEmail());
        entity.setRequestType(request.requestType());
        entity.setDetails(request.details());
        entity.setDueDate(request.dueDate());
        return entity;
    }

    public static void updateEntity(UpdateDsarRequestRequest requestDto, DsarRequest entity) {
        entity.setDataSubjectName(requestDto.dataSubjectName());
        entity.setDataSubjectEmail(requestDto.dataSubjectEmail());
        entity.setRequestType(requestDto.requestType());
        entity.setDetails(requestDto.details());
        entity.setStatus(requestDto.status());
        entity.setDueDate(requestDto.dueDate());
    }

    public static DsarRequestResponse toResponse(DsarRequest entity) {
        return new DsarRequestResponse(
            entity.getId(),
            entity.getDataSubjectName(),
            entity.getDataSubjectEmail(),
            entity.getRequestType(),
            entity.getDetails(),
            entity.getStatus(),
            entity.getDueDate(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public static DsarRequestNote toEntity(AddNoteRequest requestDto) {
        DsarRequestNote note = new DsarRequestNote();
        note.setAuthor(requestDto.author());
        note.setContent(requestDto.content());
        return note;
    }

    public static DsarRequestNoteResponse toResponse(DsarRequestNote note) {
        return new DsarRequestNoteResponse(
            note.getId(),
            note.getAuthor(),
            note.getContent(),
            note.getCreatedAt()
        );
    }
}
