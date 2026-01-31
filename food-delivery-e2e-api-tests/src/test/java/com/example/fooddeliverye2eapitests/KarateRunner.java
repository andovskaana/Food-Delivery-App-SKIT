package com.example.fooddeliverye2eapitests;

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import com.intuit.karate.junit5.Karate;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * JUnit runner for Karate E2E tests.
 */
public class KarateRunner {

    private static final int DEFAULT_THREAD_COUNT = 2;
    private static final String THREAD_COUNT = "threadCount";

    @Karate.Test
    Karate runAll() {
        return Karate.run("classpath:karate/tests");
    }
}