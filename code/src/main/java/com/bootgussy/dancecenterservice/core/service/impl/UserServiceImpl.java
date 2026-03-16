package com.bootgussy.dancecenterservice.core.service.impl;

import com.bootgussy.dancecenterservice.core.exception.AlreadyExistsException;
import com.bootgussy.dancecenterservice.core.exception.ResourceNotFoundException;
import com.bootgussy.dancecenterservice.core.model.User;
import com.bootgussy.dancecenterservice.core.repository.UserRepository;
import com.bootgussy.dancecenterservice.core.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone number: " + phoneNumber));
    }

    @Override
    public List<User> findByName(String name) {
        return userRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with name: " + name));
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User findByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with phone number: " + phoneNumber));
    }

    @Override
    public User findById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public User createUser(User user) {
        User savedUser;

        if(userRepository.findByPhoneNumber(user.getPhoneNumber()).isEmpty()) {
            savedUser = userRepository.save(user);
        }
        else {
            throw new AlreadyExistsException("User already exists with phone number:" + user.getPhoneNumber());
        }

        return savedUser;
    }

    @Override
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!existingUser.getPhoneNumber().equals(userDetails.getPhoneNumber())) {
            if (userRepository.findByPhoneNumber(userDetails.getPhoneNumber()).isPresent()) {
                throw new AlreadyExistsException("User already exists with phone number: " + userDetails.getPhoneNumber());
            }
        }

        existingUser.setName(userDetails.getName());
        existingUser.setPhoneNumber(userDetails.getPhoneNumber());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            existingUser.setPassword(userDetails.getPassword());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found. ID: " + id));

        userRepository.delete(user);
    }
}
