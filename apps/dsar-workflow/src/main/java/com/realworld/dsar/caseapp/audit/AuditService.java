package com.realworld.dsar.caseapp.audit;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
  private final AuditRepository repo;
  public AuditService(AuditRepository r){ this.repo=r; }

  public void log(Long caseId, String action, String details){
    var e = new AuditEvent();
    e.setCaseId(caseId);
    e.setAction(action);
    e.setDetails(details);
    repo.save(e);
  }
}
