package com.bootgussy.dancecenterservice.core.repository;

import com.bootgussy.dancecenterservice.core.model.Student;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    //List<Student> findByName(String name);

    @Query(value = "SELECT s.* FROM students s " +
            "LEFT JOIN users u ON s.user_id = u.id" +
            "WHERE u.name = :name AND u.phone_number = :phoneNumber", nativeQuery = true)
    List<Student> findByNameAndPhoneNumber(String name, String phoneNumber);

    Optional<Student> findByUserPhoneNumber(String phoneNumber);
}