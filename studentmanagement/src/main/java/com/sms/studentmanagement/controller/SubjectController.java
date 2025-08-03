package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.SubjectCreateDto;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.Subject;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.SubjectRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {

    private final SubjectRepository subjectRepo;
    private final CourseRepository  courseRepo;

    public SubjectController(SubjectRepository subjectRepo,
                             CourseRepository courseRepo) {
        this.subjectRepo = subjectRepo;
        this.courseRepo  = courseRepo;
    }

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepo.findAll();
    }

    @GetMapping("/by-course/{courseId}")
    public List<Subject> getByCourse(@PathVariable Long courseId) {
        return subjectRepo.findByCourseId(courseId);
    }

    @PostMapping
    public Subject createSubject(@RequestBody SubjectCreateDto dto) {
        Course course = courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Subject s = new Subject();
        s.setName(dto.getName());
        s.setCourse(course);
        return subjectRepo.save(s);
    }

    @PutMapping("/{id}")
    public Subject updateSubject(@PathVariable Long id,
                                 @RequestBody SubjectCreateDto dto) {
        Subject existing = subjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        existing.setName(dto.getName());
        // we do not allow changing course here, but you could:
        // Course c = courseRepo.findById(dto.getCourseId()).orElseThrow(...);
        // existing.setCourse(c);
        return subjectRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable Long id) {
        subjectRepo.deleteById(id);
    }
}
