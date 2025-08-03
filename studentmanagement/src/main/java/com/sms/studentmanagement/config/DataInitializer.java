// src/main/java/com/sms/studentmanagement/config/DataInitializer.java
package com.sms.studentmanagement.config;

import com.sms.studentmanagement.entity.Attendance;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.repository.AttendanceRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(StudentRepository studentRepo, AttendanceRepository attendanceRepo) {
        return args -> {
            List<Student> students = studentRepo.findAll();
            if (students.isEmpty()) return;

            LocalDate startDate = LocalDate.of(2025, 7, 26);
            LocalDate today = LocalDate.now();
            Random random = new Random();

            for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
                for (Student s : students) {
                    boolean present = random.nextBoolean();

                    // Skip if already exists
                    boolean exists = attendanceRepo.existsByStudentIdAndDate(s.getId(), date);
                    if (!exists) {
                        Attendance a = new Attendance();
                        a.setDate(date);
                        a.setStudent(s);
                        a.setPresent(present);
                        attendanceRepo.save(a);
                    }
                }
            }

            System.out.println("✅ Dynamic attendance records generated from 26/07/2025 to " + today);
        };
    }
}
