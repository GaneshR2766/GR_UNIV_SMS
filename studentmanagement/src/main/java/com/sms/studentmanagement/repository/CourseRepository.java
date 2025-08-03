package com.sms.studentmanagement.repository;

import com.sms.studentmanagement.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByNameIgnoreCase(String name);
    
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.subjects")
    List<Course> findAllWithSubjects();
    
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.subjects WHERE c.id = :id")
    Optional<Course> findByIdWithSubjects(@Param("id") Long id);
}