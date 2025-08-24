package oj.onlineCodingCompetition.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestChatDTO;
import oj.onlineCodingCompetition.dto.CreateChatMessageRequest;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.ContestChat;
import oj.onlineCodingCompetition.entity.ContestRegistration;
import oj.onlineCodingCompetition.repository.ContestChatRepository;
import oj.onlineCodingCompetition.repository.ContestRegistrationRepository;
import oj.onlineCodingCompetition.repository.ContestRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContestChatService {

    private final ContestChatRepository chatRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;
    private final ContestRegistrationRepository registrationRepository;

    /**
     * Gửi tin nhắn mới
     */
    public ContestChatDTO sendMessage(CreateChatMessageRequest request, String username) {
        log.debug("Gửi tin nhắn mới cho contest {} bởi user {}", request.getContestId(), username);

        // Tìm user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        // Tìm contest
        Contest contest = contestRepository.findById(request.getContestId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy contest với ID: " + request.getContestId()));

        // Kiểm tra contest có bật chat không
        if (!contest.isChatEnabled()) {
            throw new RuntimeException("Chat đã bị tắt cho contest này");
        }

        // Kiểm tra user có quyền tham gia chat không
        if (!canUserParticipateInChat(contest, user)) {
            throw new RuntimeException("Bạn không có quyền tham gia chat trong contest này");
        }

        // Tạo tin nhắn
        ContestChat chatMessage = new ContestChat();
        chatMessage.setContest(contest);
        chatMessage.setUser(user);
        chatMessage.setMessage(request.getMessage());
        chatMessage.setCreatedAt(LocalDateTime.now());
        chatMessage.setMessageType(request.getMessageType());

        ContestChat savedMessage = chatRepository.save(chatMessage);
        log.info("Đã gửi tin nhắn với ID: {}", savedMessage.getId());

        return convertToDTO(savedMessage, user);
    }

    /**
     * Lấy danh sách tin nhắn của contest
     */
    @Transactional(readOnly = true)
    public Page<ContestChatDTO> getMessagesByContest(Long contestId, int page, int size, String currentUsername) {
        log.debug("Lấy tin nhắn cho contest {} - page: {}, size: {}", contestId, page, size);

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy contest với ID: " + contestId));

        // Kiểm tra contest có bật chat không
        if (!contest.isChatEnabled()) {
            throw new RuntimeException("Chat đã bị tắt cho contest này");
        }

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null && !canUserParticipateInChat(contest, currentUser)) {
                throw new RuntimeException("Bạn không có quyền xem chat trong contest này");
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ContestChat> messages = chatRepository.findByContestAndDeletedFalse(contest, pageable);

        final User finalCurrentUser = currentUser;
        return messages.map(message -> convertToDTO(message, finalCurrentUser));
    }

    /**
     * Lấy tin nhắn mới nhất
     */
    @Transactional(readOnly = true)
    public List<ContestChatDTO> getRecentMessages(Long contestId, int limit, String currentUsername) {
        log.debug("Lấy {} tin nhắn mới nhất cho contest {}", limit, contestId);

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy contest với ID: " + contestId));

        if (!contest.isChatEnabled()) {
            throw new RuntimeException("Chat đã bị tắt cho contest này");
        }

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null && !canUserParticipateInChat(contest, currentUser)) {
                throw new RuntimeException("Bạn không có quyền xem chat trong contest này");
            }
        }

        Pageable pageable = PageRequest.of(0, limit);
        List<ContestChat> messages = chatRepository.findRecentMessagesByContest(contest, pageable);

        final User finalCurrentUser = currentUser;
        return messages.stream()
                .map(message -> convertToDTO(message, finalCurrentUser))
                .collect(Collectors.toList());
    }

    /**
     * Lấy tin nhắn sau một thời điểm cụ thể (cho real-time update)
     */
    @Transactional(readOnly = true)
    public List<ContestChatDTO> getMessagesAfter(Long contestId, LocalDateTime since, String currentUsername) {
        log.debug("Lấy tin nhắn sau {} cho contest {}", since, contestId);

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy contest với ID: " + contestId));

        if (!contest.isChatEnabled()) {
            throw new RuntimeException("Chat đã bị tắt cho contest này");
        }

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null && !canUserParticipateInChat(contest, currentUser)) {
                throw new RuntimeException("Bạn không có quyền xem chat trong contest này");
            }
        }

        List<ContestChat> messages = chatRepository.findByContestAndCreatedAtAfterAndDeletedFalse(contest, since);

        final User finalCurrentUser = currentUser;
        return messages.stream()
                .map(message -> convertToDTO(message, finalCurrentUser))
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật tin nhắn
     */
    public ContestChatDTO updateMessage(Long messageId, String newMessage, String username) {
        log.debug("Cập nhật tin nhắn {} bởi user {}", messageId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        ContestChat chatMessage = chatRepository.findByIdAndDeletedFalse(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        // Kiểm tra quyền sửa (chỉ chủ tin nhắn hoặc admin/contest creator)
        if (!canUserEditMessage(chatMessage, user)) {
            throw new RuntimeException("Bạn không có quyền sửa tin nhắn này");
        }

        chatMessage.setMessage(newMessage);
        chatMessage.setUpdatedAt(LocalDateTime.now());

        ContestChat updatedMessage = chatRepository.save(chatMessage);
        log.info("Đã cập nhật tin nhắn với ID: {}", updatedMessage.getId());

        return convertToDTO(updatedMessage, user);
    }

    /**
     * Xóa tin nhắn (soft delete)
     */
    public void deleteMessage(Long messageId, String username) {
        log.debug("Xóa tin nhắn {} bởi user {}", messageId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        ContestChat chatMessage = chatRepository.findByIdAndDeletedFalse(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        // Kiểm tra quyền xóa (chỉ chủ tin nhắn hoặc admin/contest creator)
        if (!canUserEditMessage(chatMessage, user)) {
            throw new RuntimeException("Bạn không có quyền xóa tin nhắn này");
        }

        chatMessage.setDeleted(true);
        chatMessage.setDeletedAt(LocalDateTime.now());
        chatMessage.setDeletedBy(user.getId());

        chatRepository.save(chatMessage);
        log.info("Đã xóa tin nhắn với ID: {}", messageId);
    }

    /**
     * Bật/tắt chat cho contest (chỉ contest creator hoặc admin)
     */
    public void toggleContestChat(Long contestId, boolean enabled, String username) {
        log.debug("Thay đổi trạng thái chat contest {} thành {} bởi user {}", contestId, enabled, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy contest với ID: " + contestId));

        // Kiểm tra quyền (chỉ contest creator hoặc admin)
        if (!contest.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Bạn không có quyền thay đổi cài đặt chat cho contest này");
        }

        contest.setChatEnabled(enabled);
        contestRepository.save(contest);

        log.info("Đã {} chat cho contest {}", enabled ? "bật" : "tắt", contestId);
    }

    /**
     * Kiểm tra user có thể tham gia chat không
     */
    private boolean canUserParticipateInChat(Contest contest, User user) {
        // Admin luôn có thể tham gia
        if ("admin".equals(user.getRole())) {
            return true;
        }

        // Contest creator luôn có thể tham gia
        if (contest.getCreatedBy().getId().equals(user.getId())) {
            return true;
        }

        // Kiểm tra đăng ký và trạng thái contest
        return registrationRepository.findByContestIdAndUserId(contest.getId(), user.getId())
                .map(registration -> registration.getStatus() == ContestRegistration.RegistrationStatus.APPROVED)
                .orElse(false);
    }

    /**
     * Kiểm tra user có thể sửa/xóa tin nhắn không
     */
    private boolean canUserEditMessage(ContestChat message, User user) {
        // Admin luôn có thể sửa/xóa
        if ("admin".equals(user.getRole())) {
            return true;
        }

        // Contest creator có thể sửa/xóa
        if (message.getContest().getCreatedBy().getId().equals(user.getId())) {
            return true;
        }

        // Chủ tin nhắn có thể sửa/xóa
        return message.getUser().getId().equals(user.getId());
    }

    /**
     * Convert entity to DTO
     */
    private ContestChatDTO convertToDTO(ContestChat message, User currentUser) {
        ContestChatDTO dto = new ContestChatDTO();
        dto.setId(message.getId());
        dto.setContestId(message.getContest().getId());
        dto.setUserId(message.getUser().getId());
        dto.setUsername(message.getUser().getUsername());
        dto.setMessage(message.getMessage());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        dto.setMessageType(message.getMessageType());
        dto.setAnnouncement(message.getMessageType() == ContestChat.MessageType.ANNOUNCEMENT);

        // Set permissions
        if (currentUser != null) {
            dto.setCanEdit(canUserEditMessage(message, currentUser));
            dto.setCanDelete(canUserEditMessage(message, currentUser));
        } else {
            dto.setCanEdit(false);
            dto.setCanDelete(false);
        }

        return dto;
    }
}
