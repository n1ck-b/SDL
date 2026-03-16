package com.bootgussy.dancecenterservice.core.repository;

import com.bootgussy.dancecenterservice.core.model.Trainer;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {
    //List<Trainer> findByName(String name);

    @Query(value = "SELECT t.* FROM trainers t " +
            "LEFT JOIN users u ON t.user_id = u.id" +
            "WHERE u.name = :name AND u.phone_number = :phoneNumber AND t.dance_style = :danceStyle", nativeQuery = true)
    List<Trainer> findByNameAndPhoneNumberAndDanceStyle(String name, String phoneNumber, String danceStyle);

    Optional<Trainer> findByUserPhoneNumber(String phoneNumber);
}