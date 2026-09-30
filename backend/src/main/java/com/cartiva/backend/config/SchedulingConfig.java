package com.cartiva.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "cartiva")
public class SchedulingConfig {

    private final Polling polling = new Polling();
    private final Retry retry = new Retry();

    public Polling getPolling() {
        return polling;
    }

    public Retry getRetry() {
        return retry;
    }

    public static class Polling {
        private boolean enabled = true;
        private long intervalMs = 30_000;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public long getIntervalMs() {
            return intervalMs;
        }

        public void setIntervalMs(long intervalMs) {
            this.intervalMs = intervalMs;
        }
    }

    public static class Retry {
        private long intervalMs = 60_000;

        public long getIntervalMs() {
            return intervalMs;
        }

        public void setIntervalMs(long intervalMs) {
            this.intervalMs = intervalMs;
        }
    }
}
