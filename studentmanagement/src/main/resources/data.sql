-- ADMIN
INSERT INTO admin (id, password, username) VALUES (1, 'admin', 'admin');

-- COURSES
INSERT INTO course (id, name) VALUES (1, 'BCA');
INSERT INTO course (id, name) VALUES (2, 'BBA');
INSERT INTO course (id, name) VALUES (3, 'BSc CS');

-- SUBJECTS (2 Common + 3 Specific per course)
-- BCA (ID 1)
INSERT INTO subject (id, name, course_id) VALUES (1, 'English', 1);
INSERT INTO subject (id, name, course_id) VALUES (2, 'Tamil', 1);
INSERT INTO subject (id, name, course_id) VALUES (3, 'PHP', 1);
INSERT INTO subject (id, name, course_id) VALUES (4, 'Java', 1);
INSERT INTO subject (id, name, course_id) VALUES (5, 'Data Structures', 1);

-- BBA (ID 2)
INSERT INTO subject (id, name, course_id) VALUES (6, 'English', 2);
INSERT INTO subject (id, name, course_id) VALUES (7, 'Tamil', 2);
INSERT INTO subject (id, name, course_id) VALUES (8, 'Economics', 2);
INSERT INTO subject (id, name, course_id) VALUES (9, 'Business Law', 2);
INSERT INTO subject (id, name, course_id) VALUES (10, 'Accounting', 2);

-- BSc CS (ID 3)
INSERT INTO subject (id, name, course_id) VALUES (11, 'English', 3);
INSERT INTO subject (id, name, course_id) VALUES (12, 'Tamil', 3);
INSERT INTO subject (id, name, course_id) VALUES (13, 'C Programming', 3);
INSERT INTO subject (id, name, course_id) VALUES (14, 'Operating Systems', 3);
INSERT INTO subject (id, name, course_id) VALUES (15, 'Networking', 3);

-- STUDENTS
INSERT INTO student (id, name, email, course_id) VALUES (1, 'Ganesh', 'ganesh@bca.com', 1);
INSERT INTO student (id, name, email, course_id) VALUES (2, 'Vaisali', 'vaisali@bca.com', 1);
INSERT INTO student (id, name, email, course_id) VALUES (3, 'Santhiya', 'santhiya@bba.com', 2);
INSERT INTO student (id, name, email, course_id) VALUES (4, 'Ajay', 'ajay@bba.com', 2);
INSERT INTO student (id, name, email, course_id) VALUES (5, 'Ram', 'ram@cs.com', 3);
INSERT INTO student (id, name, email, course_id) VALUES (6, 'Priya', 'priya@cs.com', 3);


-- MARKS
-- BCA Students: 1, 2
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (1, 1, 1, 90); -- Ganesh English
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (2, 1, 2, 85);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (3, 1, 3, 88);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (4, 1, 4, 92);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (5, 1, 5, 87);

INSERT INTO mark (id, student_id, subject_id, marks) VALUES (6, 2, 1, 75); -- Vaisali English
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (7, 2, 2, 70);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (8, 2, 3, 68);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (9, 2, 4, 80);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (10, 2, 5, 72);

-- BBA Students: 3, 4
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (11, 3, 6, 82); -- Santhiya English
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (12, 3, 7, 78);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (13, 3, 8, 84);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (14, 3, 9, 86);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (15, 3, 10, 80);

INSERT INTO mark (id, student_id, subject_id, marks) VALUES (16, 4, 6, 65); -- Ajay English
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (17, 4, 7, 70);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (18, 4, 8, 75);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (19, 4, 9, 78);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (20, 4, 10, 72);

-- BSc CS Students: 5, 6
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (21, 5, 11, 91); -- Ram English
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (22, 5, 12, 89);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (23, 5, 13, 93);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (24, 5, 14, 90);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (25, 5, 15, 94);

INSERT INTO mark (id, student_id, subject_id, marks) VALUES (26, 6, 11, 70); -- Priya English
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (27, 6, 12, 68);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (28, 6, 13, 72);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (29, 6, 14, 76);
INSERT INTO mark (id, student_id, subject_id, marks) VALUES (30, 6, 15, 74);


-- ATTENDANCE (July 14–27)