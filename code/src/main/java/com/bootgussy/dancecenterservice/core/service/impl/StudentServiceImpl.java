package com.bootgussy.dancecenterservice.core.service.impl;

import com.bootgussy.dancecenterservice.core.config.CacheConfig;
import com.bootgussy.dancecenterservice.core.exception.AlreadyExistsException;
import com.bootgussy.dancecenterservice.core.exception.ResourceNotFoundException;
import com.bootgussy.dancecenterservice.core.model.Student;
import com.bootgussy.dancecenterservice.core.model.User;
import com.bootgussy.dancecenterservice.core.repository.StudentRepository;
import com.bootgussy.dancecenterservice.core.service.StudentService;
import java.util.List;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {
    private final StudentRepository studentRepository;
    private final CacheConfig cacheConfig;

    @Autowired
    public StudentServiceImpl(StudentRepository studentRepository,
                              CacheConfig cacheConfig) {
        this.studentRepository = studentRepository;
        this.cacheConfig = cacheConfig;
    }

    @Override
    public Student findStudentById(Long id) {
        Student cachedStudent = cacheConfig.getStudent(id);
        if (cachedStudent != null) {
            return cachedStudent;
        }

        Student student = studentRepository.findById(id).orElse(null);

        if (student != null) {
            cacheConfig.putStudent(id, student);

            return student;
        } else {
            throw new ResourceNotFoundException("Student not found. ID: " + id);
        }
    }

    @Override
    public List<Student> findAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    @Transactional
    public Student createStudent(Student student) {
        if (student.getUser() == null) {
            throw new ResourceNotFoundException("User data is missing in Student object");
        }

        String phone = student.getUser().getPhoneNumber();
        if (studentRepository.findByUserPhoneNumber(phone).isPresent()) {
            throw new AlreadyExistsException("Student with phone number " + phone + " already exists.");
        }

        Student savedStudent = studentRepository.save(student);
        cacheConfig.putStudent(savedStudent.getId(), savedStudent);

        return savedStudent;
    }

    @Override
    @Transactional
    public Student updateStudent(Student student) {
        Student existingStudent = studentRepository.findById(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found. ID: " + student.getId()));

        User user = existingStudent.getUser();
        user.setName(student.getUser().getName());
        user.setPhoneNumber(student.getUser().getPhoneNumber());

        Student updated = studentRepository.save(existingStudent);
        cacheConfig.putStudent(updated.getId(), updated);

        return updated;
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found. ID: " + id));

        cacheConfig.removeStudent(student.getId());

        studentRepository.delete(student);
    }
}