package com.sms.studentmanagement.controller;
import com.sms.studentmanagement.entity.Attendance;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.repository.AttendanceRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {
    @Autowired
private AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;

    public StudentController(StudentRepository studentRepo) {
        this.studentRepo = studentRepo;
    }

    // ✅ Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // ✅ Get student by ID
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id " + id));
    }

    // ✅ Add a student
@PostMapping
public Student createStudent(@RequestBody Student student) {
    Student savedStudent = studentRepo.save(student);

    // Get all distinct attendance dates already in the system
    List<LocalDate> existingDates = attendanceRepo.findDistinctDates();

    // For each date, mark the new student as ABSENT
    for (LocalDate date : existingDates) {
        Attendance a = new Attendance();
        a.setStudent(savedStudent);
        a.setDate(date);
        a.setPresent(false);  // ❌ Default as Absent
        attendanceRepo.save(a);
    }

    return savedStudent;
}

    // ✅ Update a student (without changing course)
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student updatedStudent) {
        Student existing = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id " + id));

        existing.setName(updatedStudent.getName());
        existing.setEmail(updatedStudent.getEmail());
        // ❌ Do NOT update course to prevent changing it
        // existing.setCourse(updatedStudent.getCourse());

        return studentRepo.save(existing);
    }

    // ✅ Delete a student
    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable Long id) {
        studentRepo.deleteById(id);
    }
}
