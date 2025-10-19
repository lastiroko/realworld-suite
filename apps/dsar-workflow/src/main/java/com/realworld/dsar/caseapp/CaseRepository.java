package com.realworld.dsar.caseapp;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CaseRepository extends JpaRepository<CaseEntity, Long> {

  @Query("""
    select e from CaseEntity e
    where (:status is null or upper(e.status) = upper(:status))
      and (
        :q is null
        or lower(e.reference) like lower(concat('%', :q, '%'))
        or lower(e.owner)     like lower(concat('%', :q, '%'))
        or lower(e.summary)   like lower(concat('%', :q, '%'))
      )
  """)
  Page<CaseEntity> search(@Param("status") String status,
                          @Param("q") String q,
                          Pageable pageable);

  @Query("""
    select e from CaseEntity e
    where (:status is null or upper(e.status) = upper(:status))
      and (
        :q is null
        or lower(e.reference) like lower(concat('%', :q, '%'))
        or lower(e.owner)     like lower(concat('%', :q, '%'))
        or lower(e.summary)   like lower(concat('%', :q, '%'))
      )
  """)
  java.util.List<CaseEntity> searchAll(@Param("status") String status,
                                       @Param("q") String q,
                                       Sort sort);
}
