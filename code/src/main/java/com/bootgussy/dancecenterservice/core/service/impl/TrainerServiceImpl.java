package com.bootgussy.dancecenterservice.core.service.impl;

import com.bootgussy.dancecenterservice.core.config.CacheConfig;
import com.bootgussy.dancecenterservice.core.exception.AlreadyExistsException;
import com.bootgussy.dancecenterservice.core.exception.ResourceNotFoundException;
import com.bootgussy.dancecenterservice.core.model.Trainer;
import com.bootgussy.dancecenterservice.core.model.User;
import com.bootgussy.dancecenterservice.core.repository.TrainerRepository;
import com.bootgussy.dancecenterservice.core.service.TrainerService;
import java.util.List;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TrainerServiceImpl implements TrainerService {
    private final TrainerRepository trainerRepository;
    private final CacheConfig cacheConfig;

    @Autowired
    public TrainerServiceImpl(TrainerRepository trainerRepository,
                              CacheConfig cacheConfig) {
        this.trainerRepository = trainerRepository;
        this.cacheConfig = cacheConfig;
    }

    @Override
    public Trainer findTrainerById(Long id) {
        Trainer cachedTrainer = cacheConfig.getTrainer(id);
        if (cachedTrainer != null) {
            return cachedTrainer;
        }

        Trainer trainer = trainerRepository.findById(id).orElse(null);

        if (trainer != null) {
            cacheConfig.putTrainer(id, trainer);

            return trainer;
        } else {
            throw new ResourceNotFoundException("Trainer not found. ID: " + id);
        }
    }

    @Override
    public List<Trainer> findAllTrainers() {
        return trainerRepository.findAll();
    }

    @Override
    @Transactional
    public Trainer createTrainer(Trainer trainer) {
        if (trainer.getUser() == null || trainer.getDanceStyle() == null) {
            throw new ResourceNotFoundException("Incorrect data: User information and dance style are required.");
        }

        String phone = trainer.getUser().getPhoneNumber();
        if (trainerRepository.findByUserPhoneNumber(phone).isPresent()) { // Предполагаем наличие метода в репозитории
            throw new AlreadyExistsException("Trainer with phone number " + phone + " already exists.");
        }

        Trainer savedTrainer = trainerRepository.save(trainer);
        cacheConfig.putTrainer(savedTrainer.getId(), savedTrainer);

        return savedTrainer;
    }

    @Override
    @Transactional
    public Trainer updateTrainer(Trainer trainer) {
        Trainer existingTrainer = trainerRepository.findById(trainer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with ID: " + trainer.getId()));

        User user = existingTrainer.getUser();
        user.setName(trainer.getUser().getName());
        user.setPhoneNumber(trainer.getUser().getPhoneNumber());

        existingTrainer.setDanceStyle(trainer.getDanceStyle());

        Trainer updated = trainerRepository.save(existingTrainer);
        cacheConfig.putTrainer(updated.getId(), updated);
        return updated;
    }

    @Override
    public void deleteTrainer(Long id) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found. ID: " + id));

        cacheConfig.removeTrainer(trainer.getId());

        trainerRepository.delete(trainer);
    }
}