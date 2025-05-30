package oj.onlineCodingCompetition.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.service.ContestService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContestStatusScheduler {

    private final ContestService contestService;

    // Chạy mỗi phút để cập nhật trạng thái cuộc thi
    @Scheduled(fixedRate = 60000) // 60000ms = 1 phút
    public void updateContestStatuses() {
        log.debug("Bắt đầu cập nhật trạng thái cuộc thi");
        try {
            contestService.updateAllContestStatuses();
            log.debug("Hoàn thành cập nhật trạng thái cuộc thi");
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái cuộc thi: {}", e.getMessage());
        }
    }
} 