package com.cozysnippet.simple_mocking_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {

    private UserGeneration userGeneration = new UserGeneration();
    private MockData mockData = new MockData();

    // Getters and Setters
    public UserGeneration getUserGeneration() {
        return userGeneration;
    }

    public void setUserGeneration(UserGeneration userGeneration) {
        this.userGeneration = userGeneration;
    }

    public MockData getMockData() {
        return mockData;
    }

    public void setMockData(MockData mockData) {
        this.mockData = mockData;
    }

    // Nested Configuration Classes
    public static class UserGeneration {
        private int maxCount = 100;
        private int defaultCount = 10;

        public int getMaxCount() {
            return maxCount;
        }

        public void setMaxCount(int maxCount) {
            this.maxCount = maxCount;
        }

        public int getDefaultCount() {
            return defaultCount;
        }

        public void setDefaultCount(int defaultCount) {
            this.defaultCount = defaultCount;
        }
    }

    public static class MockData {
        private int initialUsersCount = 5;
        private boolean enableInitialData = true;

        public int getInitialUsersCount() {
            return initialUsersCount;
        }

        public void setInitialUsersCount(int initialUsersCount) {
            this.initialUsersCount = initialUsersCount;
        }

        public boolean isEnableInitialData() {
            return enableInitialData;
        }

        public void setEnableInitialData(boolean enableInitialData) {
            this.enableInitialData = enableInitialData;
        }
    }
}
