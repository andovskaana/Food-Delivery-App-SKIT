package com.example.fooddeliverye2eapitests;


import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A Test running for the Karate tests.
 */
public class KarateRunner {

    private static final int DEFAULT_THREAD_COUNT = 2;
    private static final String THREAD_COUNT = "threadCount";

    @Test
    void run() {
        int threadCount;
        try {
            String threadCountValue = System.getProperty(THREAD_COUNT);
            threadCount = Integer.parseInt(threadCountValue);
        } catch (Exception e) {
            threadCount = DEFAULT_THREAD_COUNT;
        }

        Results results = Runner.path("classpath:karate/tests/")
                .outputJunitXml(true)
                .parallel(threadCount);
        assertThat(results.getFailCount()).as(results.getErrorMessages()).isZero();
    }
}
