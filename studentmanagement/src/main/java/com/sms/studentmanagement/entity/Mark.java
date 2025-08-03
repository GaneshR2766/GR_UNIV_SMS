package com.sms.studentmanagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mark")
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

// Mark.java
@ManyToOne
@JoinColumn(name = "student_id")
private Student student;




    @ManyToOne
    private Subject subject;

    private int marks;

    public Long getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public Subject getSubject() {
        return subject;
    }

    public int getMarks() {
        return marks;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public void setMarks(int marks) {
        this.marks = marks;
    }
}
