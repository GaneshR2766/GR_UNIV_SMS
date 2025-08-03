package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.entity.Attendance;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.repository.AttendanceRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;

    public AttendanceController(AttendanceRepository attendanceRepo, StudentRepository studentRepo) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        // Get all students and all attendance dates
        List<Student> allStudents = studentRepo.findAll();
        List<LocalDate> allDates = attendanceRepo.findDistinctDates();
        
        // For each student, ensure they have attendance records for all dates
        allStudents.forEach(student -> {
            List<LocalDate> studentDates = attendanceRepo.findDatesByStudentId(student.getId());
            List<LocalDate> missingDates = allDates.stream()
                .filter(date -> !studentDates.contains(date))
                .collect(Collectors.toList());
                
            missingDates.forEach(date -> {
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setDate(date);
                attendance.setPresent(false); // Default to absent
                attendanceRepo.save(attendance);
            });
        });
        
        return attendanceRepo.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudentId(@PathVariable Long studentId) {
        return attendanceRepo.findByStudentId(studentId);
    }

    @GetMapping("/date/{date}")
    public List<Attendance> getAttendanceByDate(@PathVariable String date) {
        LocalDate attendanceDate = LocalDate.parse(date);
        
        // Get all students
        List<Student> allStudents = studentRepo.findAll();
        
        // For each student, check if they have attendance for this date
        allStudents.forEach(student -> {
            boolean hasAttendance = attendanceRepo.existsByStudentIdAndDate(student.getId(), attendanceDate);
            if (!hasAttendance) {
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setDate(attendanceDate);
                attendance.setPresent(false); // Default to absent
                attendanceRepo.save(attendance);
            }
        });
        
        return attendanceRepo.findByDate(attendanceDate);
    }

    @PostMapping
    public Attendance markAttendance(@RequestParam Long studentId,
                                   @RequestParam String date,
                                   @RequestParam boolean present) {
        Optional<Student> studentOpt = studentRepo.findById(studentId);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        // Check if attendance already exists
        LocalDate attendanceDate = LocalDate.parse(date);
        Optional<Attendance> existing = attendanceRepo.findByStudentIdAndDate(studentId, attendanceDate);
        
        if (existing.isPresent()) {
            // Update existing
            Attendance attendance = existing.get();
            attendance.setPresent(present);
            return attendanceRepo.save(attendance);
        } else {
            // Create new
            Attendance attendance = new Attendance();
            attendance.setStudent(studentOpt.get());
            attendance.setDate(attendanceDate);
            attendance.setPresent(present);
            return attendanceRepo.save(attendance);
        }
    }

    @PutMapping("/{id}")
    public Attendance updateAttendance(@PathVariable Long id,
                                     @RequestParam boolean present) {
        Attendance attendance = attendanceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setPresent(present);
        return attendanceRepo.save(attendance);
    }

    @GetMapping("/initialize")
    public String initializeAttendanceForNewStudents() {
        LocalDate currentDate = LocalDate.now();
        List<LocalDate> allDates = attendanceRepo.findDistinctDates();
        
        if (allDates.isEmpty()) {
            // If no attendance records exist at all, create for today
            allDates.add(currentDate);
        }
        
        studentRepo.findAll().forEach(student -> {
            allDates.forEach(date -> {
                if (!attendanceRepo.existsByStudentIdAndDate(student.getId(), date)) {
                    Attendance attendance = new Attendance();
                    attendance.setStudent(student);
                    attendance.setDate(date);
                    attendance.setPresent(false); // Default to absent
                    attendanceRepo.save(attendance);
                }
            });
        });
        
        return "Attendance records initialized for all students";
    }
}