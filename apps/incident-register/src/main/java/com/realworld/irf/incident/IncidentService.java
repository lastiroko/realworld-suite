package com.realworld.irf.incident;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.time.Instant;

@Service
public class IncidentService {
  private final IncidentRepository repo;
  public IncidentService(IncidentRepository r){ this.repo=r; }

  @Transactional public IncidentEntity create(String title, String severity){
    var e=new IncidentEntity(); e.setTitle(title); e.setSeverity(severity.toUpperCase());
    return repo.save(e);
  }
  @Transactional public IncidentEntity approveSection8(Long id){
    var e=repo.findById(id).orElseThrow();
    if(!"OPEN".equals(e.getState())) throw new IllegalArgumentException("Only OPEN -> SECTION8");
    e.setState("SECTION8"); e.setSection8ApprovedAt(Instant.now());
    return repo.save(e);
  }
  @Transactional public IncidentEntity close(Long id){
    var e=repo.findById(id).orElseThrow();
    if(!"SECTION8".equals(e.getState())) throw new IllegalArgumentException("Only SECTION8 -> CLOSED");
    e.setState("CLOSED"); e.setClosedAt(Instant.now());
    return repo.save(e);
  }
}
