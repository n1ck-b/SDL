package com.bootgussy.dancecenterservice.core.service;

import com.bootgussy.dancecenterservice.core.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {
    List<User> findByName(String name);
    List<User> findAllUsers();
    User findById(Long id);
    User findByPhoneNumber(String phoneNumber);

    User createUser(User user);

    User updateUser(Long id, User user);

    void deleteUser(Long id);
}
