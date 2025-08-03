package com.sms.studentmanagement.repository;

import com.sms.studentmanagement.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByDate(LocalDate date);
    
    @Query("SELECT DISTINCT a.date FROM Attendance a")
    List<LocalDate> findDistinctDates();
    
    @Query("SELECT a.date FROM Attendance a WHERE a.student.id = ?1")
    List<LocalDate> findDatesByStudentId(Long studentId);
    
    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);
    
    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);
}