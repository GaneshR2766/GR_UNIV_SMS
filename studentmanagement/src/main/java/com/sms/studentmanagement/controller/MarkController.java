package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.entity.*;
import com.sms.studentmanagement.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "http://localhost:3000")
public class MarkController {

    private final MarkRepository markRepo;
    private final StudentRepository studentRepo;
    private final SubjectRepository subjectRepo;
    private final CourseRepository courseRepo;

    public MarkController(MarkRepository markRepo,
                         StudentRepository studentRepo,
                         SubjectRepository subjectRepo,
                         CourseRepository courseRepo) {
        this.markRepo = markRepo;
        this.studentRepo = studentRepo;
        this.subjectRepo = subjectRepo;
        this.courseRepo = courseRepo;
    }

    @GetMapping
    public List<Mark> getAllMarks() {
        return markRepo.findAll();
    }

    @GetMapping("/by-student/{studentId}")
    public List<Mark> getByStudent(@PathVariable Long studentId) {
        return markRepo.findByStudentId(studentId);
    }

    @GetMapping("/student/{studentId}/details")
    public StudentMarksResponse getStudentMarksDetails(@PathVariable Long studentId) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<Subject> courseSubjects = subjectRepo.findByCourseId(student.getCourse().getId());
        List<Mark> existingMarks = markRepo.findByStudentId(studentId);

        List<SubjectMarkDto> marks = courseSubjects.stream()
                .map(subject -> {
                    Optional<Mark> existingMark = existingMarks.stream()
                            .filter(m -> m.getSubject().getId().equals(subject.getId()))
                            .findFirst();
                    
                    return new SubjectMarkDto(
                            subject.getId(),
                            subject.getName(),
                            existingMark.isPresent() ? existingMark.get().getMarks() : null,
                            existingMark.isPresent() ? existingMark.get().getId() : null
                    );
                })
                .collect(Collectors.toList());

        return new StudentMarksResponse(
                student.getId(),
                student.getName(),
                student.getCourse().getName(),
                marks
        );
    }

    @PutMapping("/bulk")
    public List<Mark> updateMarksBulk(@RequestBody List<MarkUpdateDto> updates) {
        return updates.stream().map(dto -> {
            if (dto.getMarkId() != null) {
                // Update existing mark
                Mark mark = markRepo.findById(dto.getMarkId())
                        .orElseThrow(() -> new RuntimeException("Mark not found"));
                mark.setMarks(dto.getMarks());
                return markRepo.save(mark);
            } else {
                // Create new mark
                Student student = studentRepo.findById(dto.getStudentId())
                        .orElseThrow(() -> new RuntimeException("Student not found"));
                Subject subject = subjectRepo.findById(dto.getSubjectId())
                        .orElseThrow(() -> new RuntimeException("Subject not found"));
                
                Mark mark = new Mark();
                mark.setStudent(student);
                mark.setSubject(subject);
                mark.setMarks(dto.getMarks());
                return markRepo.save(mark);
            }
        }).collect(Collectors.toList());
    }

    @GetMapping("/student/{studentId}/total")
    public int getStudentTotalMarks(@PathVariable Long studentId) {
        return markRepo.findByStudentId(studentId)
                .stream()
                .mapToInt(Mark::getMarks)
                .sum();
    }

    // DTO classes
    public static class StudentMarksResponse {
        private Long studentId;
        private String studentName;
        private String courseName;
        private List<SubjectMarkDto> marks;
        
        public StudentMarksResponse(Long studentId, String studentName, String courseName, List<SubjectMarkDto> marks) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.courseName = courseName;
            this.marks = marks;
        }

        // Getters
        public Long getStudentId() { return studentId; }
        public String getStudentName() { return studentName; }
        public String getCourseName() { return courseName; }
        public List<SubjectMarkDto> getMarks() { return marks; }
    }

    public static class SubjectMarkDto {
        private Long subjectId;
        private String subjectName;
        private Integer marks;
        private Long markId;
        
        public SubjectMarkDto(Long subjectId, String subjectName, Integer marks, Long markId) {
            this.subjectId = subjectId;
            this.subjectName = subjectName;
            this.marks = marks;
            this.markId = markId;
        }

        // Getters
        public Long getSubjectId() { return subjectId; }
        public String getSubjectName() { return subjectName; }
        public Integer getMarks() { return marks; }
        public Long getMarkId() { return markId; }
    }

    public static class MarkUpdateDto {
        private Long markId;
        private Long studentId;
        private Long subjectId;
        private int marks;
        
        // Getters and setters
        public Long getMarkId() { return markId; }
        public void setMarkId(Long markId) { this.markId = markId; }
        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }
    }
    
}