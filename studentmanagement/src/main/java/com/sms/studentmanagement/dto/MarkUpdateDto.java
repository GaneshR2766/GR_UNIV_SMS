package com.sms.studentmanagement.dto;

public class MarkUpdateDto {
    private Long id;
    private Long studentId;
    private Long subjectId;
    private int marks;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
}