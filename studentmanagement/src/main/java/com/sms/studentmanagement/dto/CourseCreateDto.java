package com.sms.studentmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CourseCreateDto {
    @NotBlank(message = "Course name is required")
    private String name;
    
    private List<String> subjects;

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<String> subjects) {
        this.subjects = subjects;
    }
}