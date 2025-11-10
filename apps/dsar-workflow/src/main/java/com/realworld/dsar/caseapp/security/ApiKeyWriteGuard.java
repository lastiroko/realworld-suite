package com.realworld.dsar.caseapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyWriteGuard extends OncePerRequestFilter {

  @Value("${app.apiKey:}")
  private String configuredKey;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String m = request.getMethod();
    // allow GET/OPTIONS without API key; guard write methods
    return "GET".equals(m) || "OPTIONS".equals(m);
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    if (shouldNotFilter(req)) { // extra safety
      chain.doFilter(req, res);
      return;
    }

    String key = req.getHeader("X-API-Key");
    boolean ok = (configuredKey == null || configuredKey.isBlank()) || (key != null && key.equals(configuredKey));
    if (ok) {
      chain.doFilter(req, res);
    } else {
      res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      res.setContentType("application/json");
      res.getWriter().write("{\"error\":\"missing_or_invalid_api_key\"}");
    }
  }
}
