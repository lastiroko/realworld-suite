package com.realworld.dsar.service;

import com.realworld.dsar.domain.DsarRequest;
import com.realworld.dsar.domain.RequestStatus;
import com.realworld.dsar.repository.DsarRequestRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoSeeder implements CommandLineRunner {

    private final DsarRequestRepository requestRepository;
    private final DsarRequestService requestService;
    private final boolean enabled;

    public DemoSeeder(
        DsarRequestRepository requestRepository,
        DsarRequestService requestService,
        @Value("${demo.seed.enabled:false}") boolean enabled
    ) {
        this.requestRepository = requestRepository;
        this.requestService = requestService;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || requestRepository.count() > 0) {
            return;
        }

        LocalDate today = LocalDate.now();

        DsarRequest a = build("Amelia Hart", "amelia.hart@example.com", "ACCESS",
            "Requesting all stored personal data per GDPR Article 15.",
            today.plusDays(2));
        DsarRequest b = build("Marcus Lin", "marcus.lin@example.com", "DELETION",
            "Right-to-erasure request following account closure.",
            today.plusDays(8));
        DsarRequest c = build("Priya Shah", "priya.shah@example.com", "PORTABILITY",
            "Export of profile and order history in machine-readable format.",
            today.plusDays(12));
        DsarRequest d = build("Diego Romero", "diego.r@example.com", "RECTIFICATION",
            "Correct billing address on file.",
            today.plusDays(6));
        DsarRequest e = build("Hannah Okafor", "hannah.o@example.com", "ACCESS",
            "Subject access request for authentication logs.",
            today.plusDays(20));
        DsarRequest f = build("Yuki Tanaka", "yuki.t@example.com", "RESTRICTION",
            "Restrict marketing processing pending dispute.",
            today.plusDays(4));

        for (DsarRequest r : List.of(a, b, c, d, e, f)) {
            requestService.save(r);
        }

        requestService.updateStatus(b.getId(), RequestStatus.IN_PROGRESS,
            "Identity verified via passport copy");
        requestService.updateStatus(c.getId(), RequestStatus.IN_PROGRESS,
            "Pulling order data from warehouse");
        requestService.updateStatus(d.getId(), RequestStatus.ON_HOLD,
            "Awaiting subject confirmation of new address");
        requestService.updateStatus(e.getId(), RequestStatus.COMPLETED,
            "Data delivered via encrypted ZIP");
    }

    private DsarRequest build(String name, String email, String type, String details, LocalDate due) {
        DsarRequest r = new DsarRequest();
        r.setDataSubjectName(name);
        r.setDataSubjectEmail(email);
        r.setRequestType(type);
        r.setDetails(details);
        r.setDueDate(due);
        return r;
    }
}
