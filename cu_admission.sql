CREATE DATABASE CU_Admission;
USE CU_Admission;

CREATE TABLE Department (
    Dept_ID INT PRIMARY KEY AUTO_INCREMENT,
    Dept_Name VARCHAR(100) NOT NULL
);

CREATE TABLE Course (
    Course_ID INT PRIMARY KEY AUTO_INCREMENT,
    Course_Name VARCHAR(100) NOT NULL,
    Dept_ID INT,
    Fee INT NOT NULL,
    FOREIGN KEY (Dept_ID) REFERENCES Department(Dept_ID)
);

CREATE TABLE Student (
    Student_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    DOB DATE NOT NULL,
    Contact VARCHAR(20),
    Email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Admission (
    Admission_ID INT PRIMARY KEY AUTO_INCREMENT,
    Student_ID INT,
    Course_ID INT,
    CUCET_Score INT,
    Final_Fee INT,
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID)
);

