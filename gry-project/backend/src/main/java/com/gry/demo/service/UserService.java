package com.gry.demo.service;

import com.gry.demo.dto.UserDto;
import com.gry.demo.entity.User;
import com.gry.demo.exception.BusinessException;
import com.gry.demo.exception.ResourceNotFoundException;
import com.gry.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new BusinessException("USER_EXISTS", "用户名已存在: " + userDto.getUsername());
        }
        
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new BusinessException("EMAIL_EXISTS", "邮箱已存在: " + userDto.getEmail());
        }
        
        User user = new User(userDto.getUsername(), userDto.getEmail(), userDto.getPassword());
        return userRepository.save(user);
    }
    
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
    
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
    
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String username, String email, Pageable pageable) {
        return userRepository.findUsersWithFilters(username, email, pageable);
    }
    
    public User updateUser(Long id, UserDto userDto) {
        User existingUser = getUserById(id);
        
        if (!existingUser.getUsername().equals(userDto.getUsername()) 
            && userRepository.existsByUsername(userDto.getUsername())) {
            throw new BusinessException("USER_EXISTS", "用户名已存在: " + userDto.getUsername());
        }
        
        if (!existingUser.getEmail().equals(userDto.getEmail()) 
            && userRepository.existsByEmail(userDto.getEmail())) {
            throw new BusinessException("EMAIL_EXISTS", "邮箱已存在: " + userDto.getEmail());
        }
        
        existingUser.setUsername(userDto.getUsername());
        existingUser.setEmail(userDto.getEmail());
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            existingUser.setPassword(userDto.getPassword());
        }
        
        return userRepository.save(existingUser);
    }
    
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}