package com.bootgussy.dancecenterservice.core.repository;

import com.bootgussy.dancecenterservice.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<List<User>> findByName(String name);
    Optional<User> findByPhoneNumber(String phoneNumber);
}
