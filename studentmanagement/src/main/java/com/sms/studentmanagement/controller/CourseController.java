package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.CourseCreateDto;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.Subject;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
// Change from javax.validation to jakarta.validation
import jakarta.validation.Valid;
import java.util.ArrayList;  // Add this import
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final CourseRepository courseRepo;
    private final SubjectRepository subjectRepo;
    private static final List<String> DEFAULT_SUBJECTS = List.of("English", "Tamil");

    public CourseController(CourseRepository courseRepo, SubjectRepository subjectRepo) {
        this.courseRepo = courseRepo;
        this.subjectRepo = subjectRepo;
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepo.findAllWithSubjects();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Course createCourseWithSubjects(@Valid @RequestBody CourseCreateDto courseDto) {
        validateCourseInput(courseDto);
        
        Course newCourse = new Course();
        newCourse.setName(courseDto.getName());
        Course savedCourse = courseRepo.save(newCourse);
        
        createAndSaveSubjects(savedCourse, courseDto.getSubjects());
        
        return courseRepo.findByIdWithSubjects(savedCourse.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve created course"));
    }

    private void validateCourseInput(CourseCreateDto courseDto) {
        if (courseDto.getName() == null || courseDto.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course name is required");
        }
        if (courseRepo.existsByNameIgnoreCase(courseDto.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course already exists");
        }
    }

    private void createAndSaveSubjects(Course course, List<String> customSubjects) {
        List<Subject> subjectsToSave = new ArrayList<>();
        
        // Add default subjects
        DEFAULT_SUBJECTS.forEach(name -> 
            subjectsToSave.add(createSubject(name, course)));
        
        // Add custom subjects
        if (customSubjects != null) {
            customSubjects.stream()
                .filter(name -> name != null && !name.trim().isEmpty())
                .forEach(name -> 
                    subjectsToSave.add(createSubject(name, course)));
        }
        
        subjectRepo.saveAll(subjectsToSave);
    }

    private Subject createSubject(String name, Course course) {
        Subject subject = new Subject();
        subject.setName(name);
        subject.setCourse(course);
        return subject;
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseRepo.findByIdWithSubjects(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Course not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteCourse(@PathVariable Long id) {
        if (!courseRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        courseRepo.deleteById(id);
    }
}