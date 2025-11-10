package com.realworld.dsar.caseapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class CaseSearchApiTest {

  @Autowired MockMvc mvc;

  @Test
  void pageSearchWorks() throws Exception {
    // create a couple of cases (write calls include API key)
    mvc.perform(post("/api/cases")
        .contentType(MediaType.APPLICATION_JSON)
        .header("X-API-Key","dev-secret")
        .content("{}"))
       .andExpect(status().isOk());

    mvc.perform(post("/api/cases")
        .contentType(MediaType.APPLICATION_JSON)
        .header("X-API-Key","dev-secret")
        .content("{\"dueDays\":5}"))
       .andExpect(status().isOk());

    // query first page
    mvc.perform(get("/api/cases/page")
        .param("q","")
        .param("status","")
        .param("page","0")
        .param("size","1")
        .param("sort","dueAt,asc"))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.content").isArray())
       .andExpect(jsonPath("$.page").value(0));
  }
}
