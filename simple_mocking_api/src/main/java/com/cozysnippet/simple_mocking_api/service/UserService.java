package com.cozysnippet.simple_mocking_api.service;

import com.cozysnippet.simple_mocking_api.model.User;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {
    
    private final Map<Long, User> users = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);
    
    public UserService() {
        // Initialize with some mock data
        createUser(new User(null, "John", "Doe", "john.doe@email.com", "+1-555-0123", "123 Main St", "New York", "USA"));
        createUser(new User(null, "Jane", "Smith", "jane.smith@email.com", "+1-555-0124", "456 Oak Ave", "Los Angeles", "USA"));
        createUser(new User(null, "Bob", "Johnson", "bob.johnson@email.com", "+1-555-0125", "789 Pine Rd", "Chicago", "USA"));
        createUser(new User(null, "Alice", "Brown", "alice.brown@email.com", "+1-555-0126", "321 Elm St", "Houston", "USA"));
        createUser(new User(null, "Charlie", "Davis", "charlie.davis@email.com", "+1-555-0127", "654 Maple Dr", "Phoenix", "USA"));
    }
    
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
    
    public Optional<User> getUserById(Long id) {
        return Optional.ofNullable(users.get(id));
    }
    
    public User createUser(User user) {
        Long id = idCounter.getAndIncrement();
        user.setId(id);
        users.put(id, user);
        return user;
    }
    
    public Optional<User> updateUser(Long id, User updatedUser) {
        if (users.containsKey(id)) {
            updatedUser.setId(id);
            users.put(id, updatedUser);
            return Optional.of(updatedUser);
        }
        return Optional.empty();
    }
    
    public boolean deleteUser(Long id) {
        return users.remove(id) != null;
    }
    
    public List<User> generateUsers(int count) {
        List<User> generatedUsers = new ArrayList<>();
        String[] firstNames = {"Alex", "Sam", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Avery", "Quinn", "Dakota"};
        String[] lastNames = {"Wilson", "Martinez", "Garcia", "Lopez", "Anderson", "Thomas", "Jackson", "White", "Harris", "Clark"};
        String[] cities = {"Seattle", "Denver", "Austin", "Portland", "Nashville", "Atlanta", "Boston", "Miami", "Detroit", "Minneapolis"};
        String[] countries = {"USA", "Canada", "UK", "Australia", "Germany"};
        
        Random random = new Random();
        
        for (int i = 0; i < count; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com";
            String phone = "+1-555-" + String.format("%04d", random.nextInt(10000));
            String address = (random.nextInt(999) + 1) + " " + firstNames[random.nextInt(firstNames.length)] + " St";
            String city = cities[random.nextInt(cities.length)];
            String country = countries[random.nextInt(countries.length)];
            
            User user = new User(null, firstName, lastName, email, phone, address, city, country);
            User createdUser = createUser(user);
            generatedUsers.add(createdUser);
        }
        
        return generatedUsers;
    }
}
