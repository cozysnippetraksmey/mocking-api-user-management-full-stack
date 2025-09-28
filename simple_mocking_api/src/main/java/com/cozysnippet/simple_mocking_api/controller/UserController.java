package com.cozysnippet.simple_mocking_api.controller;

import com.cozysnippet.simple_mocking_api.model.User;
import com.cozysnippet.simple_mocking_api.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userService.getAllUsers();
        logger.info("Retrieved {} users", users.size());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        logger.info("Fetching user with ID: {}", id);
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            logger.info("Found user: {}", user.get().getEmail());
        } else {
            logger.warn("User with ID {} not found", id);
        }
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        logger.info("Creating new user: {}", user.getEmail());
        User createdUser = userService.createUser(user);
        logger.info("User created with ID: {}", createdUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        logger.info("Updating user with ID: {}", id);
        Optional<User> updatedUser = userService.updateUser(id, user);
        if (updatedUser.isPresent()) {
            logger.info("User updated: {}", updatedUser.get().getEmail());
        } else {
            logger.warn("User with ID {} not found for update", id);
        }
        return updatedUser.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with ID: {}", id);
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            logger.info("User with ID {} deleted", id);
        } else {
            logger.warn("User with ID {} not found for deletion", id);
        }
        return deleted ? ResponseEntity.noContent().build()
                      : ResponseEntity.notFound().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<List<User>> generateUsers(@RequestParam(defaultValue = "0") int count) {
        // Use configured default if count is 0 or not specified
        if (count <= 0) {
            count = userService.getDefaultGenerationCount();
        }

        // Validate against configured maximum
        if (count > userService.getMaxGenerationCount()) {
            return ResponseEntity.badRequest().build();
        }

        List<User> generatedUsers = userService.generateUsers(count);
        return ResponseEntity.ok(generatedUsers);
    }

    // New configuration endpoints
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("defaultGenerationCount", userService.getDefaultGenerationCount());
        config.put("maxGenerationCount", userService.getMaxGenerationCount());
        return ResponseEntity.ok(config);
    }

    // Test endpoint for tracing verification
    @GetMapping("/test-trace")
    public ResponseEntity<Map<String, String>> testTracing() {
        logger.info("=== TRACING TEST START ===");
        logger.info("Testing if trace and span IDs are visible in logs");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Check the console logs for trace and span IDs");
        response.put("timestamp", java.time.LocalDateTime.now().toString());

        logger.info("=== TRACING TEST END ===");
        return ResponseEntity.ok(response);
    }
}
