package com.cozysnippet.simple_mocking_api.config;

import brave.sampler.Sampler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(value = "management.tracing.enabled", havingValue = "true", matchIfMissing = true)
public class TracingConfig {

    @Value("${management.tracing.sampling.probability:1.0}")
    private float samplingProbability;

    @Bean
    public Sampler alwaysSampler() {
        // For development, sample everything. For production, use probability-based sampling
        return Sampler.create(samplingProbability);
    }
}
