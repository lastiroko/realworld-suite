package com.realworld.dsar.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realworld.dsar.domain.RequestStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DsarRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullWorkflowLifecycle() throws Exception {
        LocalDate dueDate = LocalDate.now().plusDays(10);
        String createPayload = objectMapper.writeValueAsString(new CreateRequest(
            "Jane Doe",
            "jane.doe@example.com",
            "ACCESS",
            "Customer requesting access to stored data",
            dueDate.toString()
        ));

        String createResponse = mockMvc.perform(post("/api/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();

        JsonNode created = objectMapper.readTree(createResponse);
        long requestId = created.get("id").asLong();
        assertThat(created.get("status").asText()).isEqualTo(RequestStatus.NEW.name());
        assertThat(created.get("dueDate").asText()).isEqualTo(dueDate.toString());

        String listResponse = mockMvc.perform(get("/api/requests"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode list = objectMapper.readTree(listResponse);
        assertThat(list.isArray()).isTrue();
        assertThat(list).hasSize(1);

        String updatePayload = objectMapper.writeValueAsString(new UpdateRequest(
            "Jane Doe",
            "jane.doe@example.com",
            "DELETION",
            "Delete all marketing data",
            RequestStatus.IN_PROGRESS.name(),
            dueDate.plusDays(5).toString()
        ));

        String updateResponse = mockMvc.perform(put("/api/requests/" + requestId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatePayload))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode updated = objectMapper.readTree(updateResponse);
        assertThat(updated.get("status").asText()).isEqualTo(RequestStatus.IN_PROGRESS.name());
        assertThat(updated.get("requestType").asText()).isEqualTo("DELETION");

        String notePayload = objectMapper.writeValueAsString(new NoteRequest("Analyst", "Reached out to marketing for confirmation."));
        mockMvc.perform(post("/api/requests/" + requestId + "/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(notePayload))
            .andExpect(status().isCreated());

        String patchPayload = objectMapper.writeValueAsString(new StatusRequest(RequestStatus.COMPLETED.name(), "All data has been removed."));
        mockMvc.perform(patch("/api/requests/" + requestId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(patchPayload))
            .andExpect(status().isOk());

        String notesResponse = mockMvc.perform(get("/api/requests/" + requestId + "/notes"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode notes = objectMapper.readTree(notesResponse);
        assertThat(notes).hasSize(2);

        String summaryResponse = mockMvc.perform(get("/api/requests/summary/status"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode summary = objectMapper.readTree(summaryResponse).get("totals");
        assertThat(summary.get(RequestStatus.COMPLETED.name()).asLong()).isEqualTo(1L);

        String conflictPayload = objectMapper.writeValueAsString(new StatusRequest(RequestStatus.IN_PROGRESS.name(), "Attempt to reopen"));
        mockMvc.perform(patch("/api/requests/" + requestId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(conflictPayload))
            .andExpect(status().isConflict());
    }

    @Test
    void validationErrorsSurfaceAsBadRequest() throws Exception {
        String invalidPayload = objectMapper.writeValueAsString(new CreateRequest(
            "",
            "invalid-email",
            "",
            "",
            LocalDate.now().minusDays(1).toString()
        ));

        mockMvc.perform(post("/api/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
            .andExpect(status().isBadRequest());
    }

    private record CreateRequest(String dataSubjectName, String dataSubjectEmail, String requestType, String details, String dueDate) {}
    private record UpdateRequest(String dataSubjectName, String dataSubjectEmail, String requestType, String details, String status, String dueDate) {}
    private record NoteRequest(String author, String content) {}
    private record StatusRequest(String status, String resolutionNotes) {}
}
