package oj.onlineCodingCompetition.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.worker.WorkerService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class WorkerConfig {

    private final WorkerService workerService;

    @Bean
    public CommandLineRunner startWorker() {
        return args -> {
            log.info("Khởi động Worker Service để xử lý submissions...");
            // Khởi động worker trong một thread riêng biệt
            Thread workerThread = new Thread(() -> {
                workerService.processSubmissions();
            });
            workerThread.setName("submission-worker-thread");
            workerThread.setDaemon(true); // Thread sẽ dừng khi ứng dụng dừng
            workerThread.start();
        };
    }
}