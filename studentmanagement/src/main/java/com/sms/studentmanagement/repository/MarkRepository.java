package com.sms.studentmanagement.repository;

import com.sms.studentmanagement.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);           // All marks of a student
    List<Mark> findBySubjectId(Long subjectId);           // All marks in a subject
    List<Mark> findByStudentCourseId(Long courseId);      // Optional: all marks for students of a course
}
