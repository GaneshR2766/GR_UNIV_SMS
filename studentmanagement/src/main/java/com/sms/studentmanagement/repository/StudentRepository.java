package com.sms.studentmanagement.repository;

import com.sms.studentmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCourseId(Long courseId);  // ✅ Optional: Get students by course ID
}
