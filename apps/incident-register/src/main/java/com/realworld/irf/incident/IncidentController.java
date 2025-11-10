package com.realworld.irf.incident;
import org.springframework.web.bind.annotation.*; import java.util.*; import static java.util.stream.Collectors.*;

@RestController @RequestMapping("/api/incidents")
public class IncidentController {
  private final IncidentRepository repo; private final IncidentService svc;
  public IncidentController(IncidentRepository r, IncidentService s){ this.repo=r; this.svc=s; }

  private static IncidentResponse toDto(IncidentEntity e){
    return new IncidentResponse(e.getId(), e.getTitle(), e.getSeverity(), e.getState(),
      e.getCreatedAt(), e.getDueAt(), e.getSection8ApprovedAt(), e.getClosedAt());
  }

  @GetMapping public List<IncidentResponse> list(){ return repo.findAll().stream().map(IncidentController::toDto).toList(); }

  @PostMapping public IncidentResponse create(@RequestBody CreateIncidentRequest b){
    return toDto(svc.create(b.title(), b.severity()));
  }

  @PatchMapping("/{id}/approve-section8") public IncidentResponse approve(@PathVariable Long id){
    return toDto(svc.approveSection8(id));
  }

  @PatchMapping("/{id}/close") public IncidentResponse close(@PathVariable Long id){
    return toDto(svc.close(id));
  }

  @GetMapping("/board")
  public Map<String,List<IncidentResponse>> board(){
    Map<String,List<IncidentResponse>> out=new LinkedHashMap<>();
    out.put("OPEN",new ArrayList<>()); out.put("SECTION8",new ArrayList<>()); out.put("CLOSED",new ArrayList<>());
    for(var e:repo.findAll()) out.getOrDefault(e.getState(), out.get("OPEN")).add(toDto(e));
    out.replaceAll((k,v)->v.stream().sorted(Comparator.comparing(IncidentResponse::dueAt)).collect(toList()));
    return out;
  }
}
