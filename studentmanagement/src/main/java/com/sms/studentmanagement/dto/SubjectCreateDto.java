package com.sms.studentmanagement.dto;

public class SubjectCreateDto {
    private String name;
    private Long   courseId;
    public String getName()     { return name; }
    public Long   getCourseId() { return courseId; }
    public void   setName(String name)       { this.name = name; }
    public void   setCourseId(Long courseId) { this.courseId = courseId; }
}
