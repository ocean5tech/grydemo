package com.gry.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gry.demo.dto.UserDto;
import com.gry.demo.entity.User;
import com.gry.demo.exception.GlobalExceptionHandler;
import com.gry.demo.exception.ResourceNotFoundException;
import com.gry.demo.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private User testUser;
    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        
        testUser = new User("testuser", "test@example.com", "password123");
        testUser.setId(1L);
        
        testUserDto = new UserDto("testuser", "test@example.com", "password123");
    }

    @Test
    void getUserById_Success() throws Exception {
        when(userService.getUserById(1L)).thenReturn(testUser);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("0000"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"));

        verify(userService).getUserById(1L);
    }

    @Test
    void getUserById_NotFound() throws Exception {
        when(userService.getUserById(1L)).thenThrow(new ResourceNotFoundException("User", "id", 1L));

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("2001"));

        verify(userService).getUserById(1L);
    }

    @Test
    void createUser_Success() throws Exception {
        when(userService.createUser(any(UserDto.class))).thenReturn(testUser);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("0000"))
                .andExpect(jsonPath("$.data.username").value("testuser"));

        verify(userService).createUser(any(UserDto.class));
    }

    @Test
    void createUser_InvalidInput() throws Exception {
        UserDto invalidDto = new UserDto("", "", "");

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("1001"));
    }

    @Test
    void updateUser_Success() throws Exception {
        when(userService.updateUser(eq(1L), any(UserDto.class))).thenReturn(testUser);

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0000"))
                .andExpect(jsonPath("$.data.username").value("testuser"));

        verify(userService).updateUser(eq(1L), any(UserDto.class));
    }

    @Test
    void deleteUser_Success() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0000"));

        verify(userService).deleteUser(1L);
    }

    @Test
    void getAllUsers_Success() throws Exception {
        Page<User> userPage = new PageImpl<>(Arrays.asList(testUser));
        when(userService.getAllUsers(any())).thenReturn(userPage);

        mockMvc.perform(get("/api/users")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0000"))
                .andExpect(jsonPath("$.data.content[0].username").value("testuser"));

        verify(userService).getAllUsers(any());
    }

    @Test
    void searchUsers_Success() throws Exception {
        Page<User> userPage = new PageImpl<>(Arrays.asList(testUser));
        when(userService.searchUsers(anyString(), anyString(), any())).thenReturn(userPage);

        mockMvc.perform(get("/api/users")
                .param("page", "0")
                .param("size", "10")
                .param("username", "test")
                .param("email", "test@"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0000"))
                .andExpect(jsonPath("$.data.content[0].username").value("testuser"));

        verify(userService).searchUsers(eq("test"), eq("test@"), any());
    }
}